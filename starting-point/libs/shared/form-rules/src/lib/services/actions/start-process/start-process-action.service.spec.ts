/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import {
    START_PROCESS_DEBOUNCE_TIME,
    START_PROCESS_SUBSCRIPTION_QUERY,
    START_PROCESS_TARGET,
    StartProcessAction,
    StartProcessActionService,
    WsProcessInstanceCloud,
} from './start-process-action.service';
import { MockProvider } from 'ng-mocks';
import { AppConfigService, FormEvent, FormRulesEvent, IdentityUserService } from '@alfresco/adf-core';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import {
    StartProcessCloudService,
    NotificationCloudService,
    ProcessDefinitionCloud,
    ProcessPayloadCloud,
    ProcessInstanceCloud,
    ProcessInstanceVariable,
} from '@alfresco/adf-process-services-cloud';
import { Subject, of } from 'rxjs';
import { HandleRuleEventOnProcessFinishData } from '../../interfaces';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends Array<any> ? T[K] : DeepPartial<T[K]>;
};

const getStartProcessAction = (action: DeepPartial<StartProcessAction> = {}): StartProcessAction => {
    return {
        target: action.target ?? START_PROCESS_TARGET,
        payload: {
            correlationKey: 'corelation-key',
            processName: 'fetch-data-0',
            ...action.payload,
        },
    };
};

const getFormRulesEvent = (): FormRulesEvent => {
    const onFormLoadedEvent = new FormEvent({});
    const formRulesEvent = new FormRulesEvent('formLoaded', onFormLoadedEvent);

    return formRulesEvent;
};

const getProcessDefinitions = (): ProcessDefinitionCloud[] => {
    const definitions = Array(10)
        .fill('', 0, 10)
        .map(
            (_val, i) =>
                new ProcessDefinitionCloud({
                    key: `fetch-data-${i}`,
                    name: `fetch-data-${i}`,
                })
        );

    return definitions;
};

describe('StartProcessEventService', () => {
    const appName = 'app-name';
    const userName = 'user-name';

    let startProcessActionService: StartProcessActionService;
    let startProcessCloudService: StartProcessCloudService;
    let notificationCloudService: NotificationCloudService;
    let adfHttpClient: AdfHttpClient;
    let processInstanceId: string;
    let processDefinitions: ProcessDefinitionCloud[] = [];
    let processInstance: ProcessInstanceCloud;
    let processInstanceVariable: ProcessInstanceVariable;
    let wsNotificationSubject$: Subject<{
        data: {
            engineEvents: WsProcessInstanceCloud[];
        };
    }>;

    beforeEach(() => {
        processInstanceId = 'process-instance-id';
        processDefinitions = getProcessDefinitions();

        processInstance = {
            id: processInstanceId,
            appName: appName,
            name: processDefinitions[0].name,
        };

        processInstanceVariable = {
            id: 1,
            processInstanceId,
            appName,
            name: 'processVariable',
            processDefinitionKey: 'processDefinitionKey',
            value: 'user name',
            createTime: '2024-05-17T13:01:33.876+0000',
            lastUpdatedTime: '2024-05-17T13:01:33.876+0000',
            variableDefinitionId: 'variableDefinitionId',
            markedAsDeleted: false,
            serviceFullName: 'serviceFullName',
            serviceName: 'serviceName',
            serviceVersion: 'serviceVersion',
            taskVariable: false,
            type: 'type',
        };

        wsNotificationSubject$ = new Subject<any>();

        TestBed.configureTestingModule({
            providers: [
                StartProcessActionService,
                MockProvider(AppConfigService, {
                    get() {
                        return [{ name: appName }] as any;
                    },
                }),
                MockProvider(NotificationCloudService, {
                    makeGQLQuery() {
                        return wsNotificationSubject$;
                    },
                }),
                MockProvider(StartProcessCloudService, {
                    getProcessDefinitions: jest.fn().mockReturnValue(of(processDefinitions)),
                    startProcess() {
                        return of(processInstance);
                    },
                }),
                MockProvider(IdentityUserService, {
                    getCurrentUserInfo() {
                        return {
                            username: userName,
                        };
                    },
                }),
                MockProvider(AdfHttpClient, {
                    get() {
                        return Promise.resolve({
                            list: {
                                entries: [
                                    {
                                        entry: processInstanceVariable,
                                    },
                                ],
                            },
                        }) as any;
                    },
                }),
                provideMockFeatureFlags({
                    [STUDIO_SHARED.STUDIO_CALCULATIONS_ON_FORM_FIELDS]: true,
                }),
            ],
        });

        startProcessActionService = TestBed.inject(StartProcessActionService);
        startProcessCloudService = TestBed.inject(StartProcessCloudService);
        notificationCloudService = TestBed.inject(NotificationCloudService);
        adfHttpClient = TestBed.inject(AdfHttpClient);

        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should start subscription on start process', () => {
        const makeGQLQuerySpy = jest.spyOn(notificationCloudService, 'makeGQLQuery');

        startProcessActionService.startProcessAction(getStartProcessAction(), getFormRulesEvent());

        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        expect(makeGQLQuerySpy).toHaveBeenCalledWith(appName, START_PROCESS_SUBSCRIPTION_QUERY);
    });

    it('should NOT create new WS subscription when we already subscribed', () => {
        const makeGQLQuerySpy = jest.spyOn(notificationCloudService, 'makeGQLQuery');

        const startProcessAction = getStartProcessAction();
        const formsRulesEvent = getFormRulesEvent();

        const nextStartProcessAction = getStartProcessAction({ payload: { correlationKey: 'new-corelation-key' } });
        const nextFormsRulesEvent = getFormRulesEvent();

        startProcessActionService.startProcessAction(startProcessAction, formsRulesEvent);
        startProcessActionService.startProcessAction(nextStartProcessAction, nextFormsRulesEvent);
        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        expect(makeGQLQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('should start process', () => {
        const startProcessServiceSpy = jest.spyOn(startProcessCloudService, 'startProcess');

        const startProcessAction = getStartProcessAction();
        const formsRulesEvent = getFormRulesEvent();

        const expectedPayload = new ProcessPayloadCloud({
            name: startProcessAction.payload.processName,
            processDefinitionKey: processDefinitions[0].key,
            variables: {},
        });
        expect(startProcessCloudService.getProcessDefinitions).toHaveBeenCalledTimes(0);

        startProcessActionService.startProcessAction(startProcessAction, formsRulesEvent);
        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        expect(startProcessServiceSpy).toHaveBeenCalledWith(appName, expectedPayload);
        expect(startProcessCloudService.getProcessDefinitions).toHaveBeenCalledTimes(1);
    });

    it('should start process with variables', () => {
        const startProcessServiceSpy = jest.spyOn(startProcessCloudService, 'startProcess');

        const startProcessAction = getStartProcessAction({
            payload: {
                inputs: ['USERNAME'],
            },
        });

        const formsRulesEvent = getFormRulesEvent();

        const expectedPayload = new ProcessPayloadCloud({
            name: startProcessAction.payload.processName,
            processDefinitionKey: processDefinitions[0].key,
            variables: {
                USERNAME: 'user-name',
            },
        });

        startProcessActionService.startProcessAction(startProcessAction, formsRulesEvent);
        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        expect(startProcessServiceSpy).toHaveBeenCalledWith(appName, expectedPayload);
    });

    it('should emit value on process finish', (done) => {
        const startProcessAction = getStartProcessAction();
        const formsRulesEvent = getFormRulesEvent();

        startProcessActionService.onProcessFinishTrigger$.subscribe((data) => {
            const expectedData: HandleRuleEventOnProcessFinishData = {
                process: {
                    processInstanceId,
                    correlationKey: 'corelation-key',
                    variable: {
                        [processInstanceVariable.name]: processInstanceVariable,
                    },
                },
            };

            expect(data).toEqual(expectedData);
            done();
        });

        startProcessActionService.startProcessAction(startProcessAction, formsRulesEvent);
        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        const wsEngineEvent: WsProcessInstanceCloud = {
            entity: processInstance,
        };

        wsNotificationSubject$.next({
            data: {
                engineEvents: [wsEngineEvent],
            },
        });
    });

    it('should fetch process variable only for process started from current form', (done) => {
        const startProcessAction = getStartProcessAction();

        const formsRulesEvent = getFormRulesEvent();
        const adfGetSpy = jest.spyOn(adfHttpClient, 'get');

        startProcessActionService.onProcessFinishTrigger$.subscribe((data) => {
            const expectedData: HandleRuleEventOnProcessFinishData = {
                process: {
                    processInstanceId,
                    correlationKey: 'corelation-key',
                    variable: {
                        [processInstanceVariable.name]: processInstanceVariable,
                    },
                },
            };
            expect(data).toEqual(expectedData);
            expect(adfGetSpy).toHaveBeenCalledTimes(1);
            done();
        });

        startProcessActionService.startProcessAction(startProcessAction, formsRulesEvent);
        jest.advanceTimersByTime(START_PROCESS_DEBOUNCE_TIME);

        const wsEngineEventWithExternalProcess: WsProcessInstanceCloud = {
            entity: {
                ...processInstance,
                id: `${processInstance.id}-other-external-process`,
            },
        };

        const wsEngineEvent: WsProcessInstanceCloud = {
            entity: processInstance,
        };

        wsNotificationSubject$.next({
            data: {
                engineEvents: [wsEngineEvent, wsEngineEventWithExternalProcess],
            },
        });
    });
});
