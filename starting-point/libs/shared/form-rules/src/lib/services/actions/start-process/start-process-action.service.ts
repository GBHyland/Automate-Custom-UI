/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import {
    NotificationCloudService,
    ProcessInstanceCloud,
    ProcessInstanceVariable,
    ProcessPayloadCloud,
    StartProcessCloudService,
} from '@alfresco/adf-process-services-cloud';
import { catchError, debounce, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Subject, Observable, combineLatest, from, of, timer, EMPTY } from 'rxjs';
import { AppConfigService, FormRulesEvent, IdentityUserService } from '@alfresco/adf-core';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { ActionData, OnProcessFinishData, HandleRuleEventOnProcessFinishData } from '../../interfaces';
import { VariableResolverService } from '../../variable-resolver/variable-resolver.service';

type CorrelationKey = string;
type ProcessInstanceId = string;
type SupportedVariables = 'USERNAME';

export interface StartProcessVariableInputs {
    [key: string]: string | boolean | number;
}

export interface ProcessVariableInputs {
    [key: string]: string;
}

export type ProcessInputs = (SupportedVariables | ProcessVariableInputs)[];

export interface StartProcessAction extends ActionData {
    target: typeof START_PROCESS_TARGET;
    payload: {
        correlationKey: string;
        processName: string;
        inputs?: ProcessInputs;
    };
}

export const START_PROCESS_TARGET = 'startProcess';

export const START_PROCESS_SUBSCRIPTION_QUERY = `
    subscription {
        engineEvents(eventType: [PROCESS_COMPLETED]) {
            eventType
            entity
            processDefinitionKey
        }
    }
    `;

export interface WsProcessInstanceCloud {
    entity: ProcessInstanceCloud;
}

export const START_PROCESS_DEBOUNCE_TIME = 500;

@Injectable({
    providedIn: 'root',
})
export class StartProcessActionService {
    private variableResolver = inject(VariableResolverService);
    private startProcessCloudService = inject(StartProcessCloudService);
    private notificationCloudService = inject(NotificationCloudService);
    private appConfigService = inject(AppConfigService);
    private adfHttpClient = inject(AdfHttpClient);
    private identityUserService = inject(IdentityUserService);

    private appName = this.appConfigService.get<{ name: 'string' }[]>('alfresco-deployed-apps')?.[0]?.name;
    private notificationSubscription$: Observable<any>;

    private events: Map<CorrelationKey, OnProcessFinishData> = new Map();
    private createdProcessInstances: Map<CorrelationKey, ProcessInstanceCloud> = new Map();
    private resolvedNotificationEvents: Map<ProcessInstanceId, WsProcessInstanceCloud> = new Map();
    private receivedNotificationEventIds: string[] = [];

    private subscriptionQuery = START_PROCESS_SUBSCRIPTION_QUERY;

    private get isSubscriptionAlreadyStarted(): boolean {
        return !!this.notificationSubscription$;
    }

    private onProcessCompleteTriggerSubject$ = new Subject<void>();
    onProcessFinishTrigger$ = this.onProcessCompleteTriggerSubject$.asObservable().pipe(
        switchMap(() => {
            return this.fetchingVariablesFromProcessesUsedOnTheForm();
        }),
        map(() => {
            return this.buildEventData();
        }),
        filter((formValues): formValues is HandleRuleEventOnProcessFinishData[] => {
            return !!formValues;
        }),
        switchMap((formValues) => {
            this.cleanFiredEvents(formValues);

            return from(formValues);
        })
    );

    onProcessStartTrigger$ = new Subject<{ action: StartProcessAction; event: FormRulesEvent }>();

    constructor() {
        this.onProcessStartTrigger$
            .pipe(
                debounce(({ event }) => (event.type === 'fieldValueChanged' ? timer(START_PROCESS_DEBOUNCE_TIME) : timer(0))),
                switchMap(({ action, event }) => {
                    return combineLatest([this.startProcess(action, event), of(action)]);
                })
            )
            .subscribe(([processInstance, action]) => {
                this.createdProcessInstances.set(action.payload.correlationKey, processInstance);

                this.onProcessCompleteTriggerSubject$.next();
            });
    }

    startProcessAction(action: StartProcessAction, event: FormRulesEvent): void {
        this.onProcessStartTrigger$.next({ action, event });
    }

    isStartProcessAction(action: ActionData): action is StartProcessAction {
        return action.target === 'startProcess';
    }

    private startProcess(action: StartProcessAction, event: FormRulesEvent): Observable<ProcessInstanceCloud> {
        return this.startProcessCloudService.getProcessDefinitions(this.appName).pipe(
            tap(() => {
                this.events.set(action.payload.correlationKey, {
                    action,
                    event,
                });
                this.startListenerForProcessChangeIfNeeded();
            }),
            map((processDefinitions) => {
                return processDefinitions.filter((processDefinition) => {
                    return processDefinition.name === action.payload.processName;
                });
            }),
            switchMap((processDefinition) => {
                const processVariables = this.getStartProcessVariables(action, event);

                const payload = new ProcessPayloadCloud({
                    name: action.payload.processName,
                    processDefinitionKey: processDefinition[0]?.key,
                    variables: processVariables,
                });

                return this.startProcessCloudService.startProcess(this.appName, payload).pipe(catchError(() => EMPTY));
            }),
            take(1)
        );
    }

    private getStartProcessVariables(action: ActionData, event: FormRulesEvent): StartProcessVariableInputs {
        const variables: StartProcessVariableInputs = {};
        const inputs = action.payload['inputs'] ?? ([] as ProcessInputs);

        const supportedStaticVariables = inputs.filter((input) => typeof input === 'string') as SupportedVariables[];
        const dynamicVariables = inputs.find((input) => typeof input === 'object') as ProcessVariableInputs | undefined;

        for (const input of supportedStaticVariables) {
            variables[input] = this.getVariableInput(input);
        }

        if (dynamicVariables) {
            Object.entries(dynamicVariables).forEach(([variableName, value]) => {
                variables[variableName] = this.variableResolver.resolveExpressionString(value, event, true);
            });
        }

        return variables;
    }

    private getVariableInput(variable: SupportedVariables): string {
        if (variable === 'USERNAME') {
            return this.identityUserService.getCurrentUserInfo().username ?? '';
        }

        return '';
    }

    private startListenerForProcessChangeIfNeeded(): void {
        if (!this.isSubscriptionAlreadyStarted) {
            this.notificationSubscription$ = this.notificationCloudService.makeGQLQuery(this.appName, this.subscriptionQuery);

            this.notificationSubscription$
                .pipe(
                    map((wsEvent) => {
                        return (wsEvent.data as any).engineEvents;
                    })
                )
                .subscribe((eventEntities: WsProcessInstanceCloud[]) => {
                    const eventsIds = eventEntities.map((event) => {
                        return event.entity.id;
                    });

                    this.receivedNotificationEventIds.push(...eventsIds);
                    this.onProcessCompleteTriggerSubject$.next();
                });
        }
    }

    private fetchingVariablesFromProcessesUsedOnTheForm(): Observable<WsProcessInstanceCloud[]> {
        const variableRequests: Observable<WsProcessInstanceCloud>[] = [];

        if (this.createdProcessInstances.size === 0 || this.receivedNotificationEventIds.length === 0) {
            return combineLatest(variableRequests);
        }

        const createdProcessInstancesList = [...this.createdProcessInstances.values()];

        for (const processIdToResolve of this.receivedNotificationEventIds) {
            const processReadyToResolve = createdProcessInstancesList.find((process) => {
                return process.id === processIdToResolve;
            });

            if (processReadyToResolve) {
                variableRequests.push(this.resolveProcessVariables(processReadyToResolve));
            }
        }

        return combineLatest(variableRequests);
    }

    private buildEventData(): HandleRuleEventOnProcessFinishData[] | undefined {
        if (this.createdProcessInstances.size === 0 || this.resolvedNotificationEvents.size === 0) {
            return undefined;
        }

        const eventData: HandleRuleEventOnProcessFinishData[] = [];

        this.events.forEach(({ action }) => {
            const createdProcessByToCorrelationKey = this.createdProcessInstances.get(action.payload?.['correlationKey']);
            const finishedProcessWithVariablesAssigned = this.resolvedNotificationEvents.get(createdProcessByToCorrelationKey?.id ?? '');

            const processVariables = finishedProcessWithVariablesAssigned?.entity?.variables ?? [];
            const variablesMap = processVariables.reduce<{ [name: string]: ProcessInstanceVariable }>((acc, variable) => {
                return {
                    ...acc,
                    [variable.name]: variable,
                };
            }, {});

            if (createdProcessByToCorrelationKey?.id && finishedProcessWithVariablesAssigned) {
                this.createdProcessInstances.delete(action.payload?.['correlationKey']);
                this.resolvedNotificationEvents.delete(createdProcessByToCorrelationKey.id);

                eventData.push({
                    process: {
                        processInstanceId: createdProcessByToCorrelationKey.id,
                        correlationKey: action.payload?.['correlationKey'],
                        variable: variablesMap,
                    },
                });
            }
        });

        return eventData.length > 0 ? eventData : undefined;
    }

    private cleanFiredEvents(eventData: HandleRuleEventOnProcessFinishData[]): void {
        for (const event of eventData) {
            const {
                process: { correlationKey, processInstanceId },
            } = event;

            this.events.delete(correlationKey);
            this.createdProcessInstances.delete(correlationKey);
            this.resolvedNotificationEvents.delete(processInstanceId);
        }
    }

    private resolveProcessVariables(process: ProcessInstanceCloud): Observable<WsProcessInstanceCloud> {
        return from(this.adfHttpClient.get(`/${this.appName}/query/v1/process-instances/${process.id}/variables`)).pipe(
            map<any, WsProcessInstanceCloud>((restVariables) => {
                return {
                    entity: {
                        ...process,
                        variables: restVariables?.list?.entries?.map((e) => e.entry) ?? [],
                    },
                };
            }),
            tap((resolvedProcess) => {
                this.receivedNotificationEventIds = this.receivedNotificationEventIds.filter((id) => id === resolvedProcess?.entity?.id);
                this.resolvedNotificationEvents.set(resolvedProcess.entity.id, resolvedProcess);
            })
        );
    }
}
