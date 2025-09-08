/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@alfresco/adf-core';
import { catchError, Observable, throwError } from 'rxjs';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

@Injectable({
    providedIn: 'root',
})
export class PublicFormContainerService {
    private readonly httpCLient = inject(HttpClient);
    private readonly destroyRef = inject(DestroyRef);
    private readonly appConfigService = inject(AppConfigService);
    private readonly DEPLOYED_APPS_KEY = 'alfresco-deployed-apps';
    private readonly BASE_API_URL = 'rb/v1/public/processes';
    private readonly contextRoot = this.appConfigService.get<string>('bpmHost');
    private readonly appName = this.appConfigService.get<Record<string, string>[]>(this.DEPLOYED_APPS_KEY, [{ name: '' }])[0]['name'];

    fetchLatestProcessDefinition(processKey: string): Observable<ProcessDefinitionCloud> {
        return this.httpCLient
            .get<ProcessDefinitionCloud>(`${this.contextRoot}/${this.appName}/${this.BASE_API_URL}/latest?processDefinitionKey=${processKey}`)
            .pipe(
                catchError((error) => throwError(() => error)),
                takeUntilDestroyed(this.destroyRef)
            );
    }
}
