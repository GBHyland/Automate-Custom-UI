/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AdfHttpClient } from '@alfresco/adf-core/api';
import { BaseCloudService, FormCloudService, TaskCloudService, TaskVariableCloud } from '@alfresco/adf-process-services-cloud';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { IdpConfiguration } from '../../models/contracts/idp-configuration';
import { IdpConfigurationResponse } from '../../models/api-models/api-idp-configuration';
import { IdentityUserService } from '@alfresco/adf-core';

@Injectable({ providedIn: 'root' })
export class ProcessTaskBackendService extends BaseCloudService {
    private readonly formCloudService = inject(FormCloudService);
    private readonly taskCloudService = inject(TaskCloudService);
    private readonly identityUserService = inject(IdentityUserService);
    private readonly destroyRef = inject(DestroyRef);

    constructor(adfHttpClient: AdfHttpClient) {
        super(adfHttpClient);
    }

    getTaskAssignee$(appName: string, taskId: string): Observable<string | undefined> {
        return this.formCloudService.getTask(appName, taskId).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((resp) => {
                return resp.assignee;
            })
        );
    }

    getTaskInputData$<T>(appName: string, taskId: string): Observable<T> {
        return this.formCloudService.getTaskVariables(appName, taskId).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((taskVariables) => {
                return this.prepareJsonFromTaskVariables<T>(taskVariables);
            })
        );
    }

    getIdpConfiguration$(appName: string): Observable<IdpConfiguration> {
        const url = this.buildUrl(appName, 'configurations/idp');
        return this.get<IdpConfigurationResponse>(url).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((response) => response.configuration)
        );
    }

    claimTask$(appName: string, taskId: string): Observable<boolean> {
        if (!appName || !taskId) {
            console.error(`Claim Task: ${appName ? 'task id' : 'app name'} is empty`);
            return of(false);
        }

        const currentUser = this.identityUserService.getCurrentUserInfo();
        if (!currentUser?.username) {
            console.error('Claim Task: Current User username is empty');
            return of(false);
        }

        return this.taskCloudService.claimTask(appName, taskId, currentUser.username).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            map(() => true),
            catchError(() => of(false))
        );
    }

    unclaimTask$(appName: string, taskId: string): Observable<boolean> {
        if (!appName || !taskId) {
            console.error(`Unclaim Task: ${appName ? 'task id' : 'app name'} is empty`);
            return of(false);
        }

        return this.taskCloudService.unclaimTask(appName, taskId).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            map(() => true),
            catchError(() => of(false))
        );
    }

    getTaskClaimProperties$(appName: string, taskId: string): Observable<{ success: boolean; canClaimTask?: boolean; canUnclaimTask?: boolean }> {
        if (!appName || !taskId) {
            console.error(`Get Task Claim Properties: ${appName ? 'task id' : 'app name'} is empty`);
            return of({ success: false });
        }

        return this.taskCloudService.getTaskById(appName, taskId).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            switchMap((task) =>
                of({
                    success: true,
                    canClaimTask: this.taskCloudService.canClaimTask(task),
                    canUnclaimTask: this.taskCloudService.canUnclaimTask(task),
                })
            ),
            catchError(() => of({ success: false }))
        );
    }

    completeTask$(appName: string, taskId: string, data: Record<string, any>): Observable<boolean> {
        const url = this.buildUrl(appName, `tasks/${taskId}/complete`);
        const payload = {
            taskId,
            variables: data,
            payloadType: 'CompleteTaskPayload',
        };
        return this.post(url, payload).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(() => true),
            catchError(() => of(false))
        );
    }

    saveTaskData$(appName: string, taskId: string, data: Record<string, any>): Observable<boolean> {
        const url = this.buildUrl(appName, `tasks/${taskId}/save`);
        const payload = {
            taskId,
            variables: data,
            payloadType: 'SaveTaskPayload',
        };
        return this.post(url, payload).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(() => true),
            catchError(() => of(false))
        );
    }

    private buildUrl(appName: string, path: string, controller: 'rb' | 'query' = 'rb'): string {
        return this.trimSlashes(this.getBasePath(appName)) + `/${controller}/v1/` + this.trimSlashes(path);
    }

    private trimSlashes(input: string): string {
        return input.replace(/^\/+|\/+$/g, '');
    }

    private prepareJsonFromTaskVariables<T>(taskVariables: TaskVariableCloud[]): T {
        const result: Record<string, any> = {};
        for (const taskVariable of taskVariables) {
            result[this.convertStringToCamelCase(taskVariable.name)] = this.toCamelCase(taskVariable.value);
        }
        return result as unknown as T;
    }

    private toCamelCase<T>(input: T): T {
        if (!input) {
            return input;
        }

        if (Array.isArray(input)) {
            return input.map((item) => this.toCamelCase(item)) as unknown as T;
        } else if (typeof input === 'object') {
            const result: Record<string, any> = {};
            for (const key of Object.keys(input)) {
                const camelKey = this.convertStringToCamelCase(key);
                result[camelKey] = this.toCamelCase((input as Record<string, any>)[key]);
            }
            return result as unknown as T;
        }

        return input;
    }

    private convertStringToCamelCase(input: string): string {
        return input.charAt(0).toLowerCase() + input.slice(1);
    }
}
