/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { FormCloudService, FormRepresentation } from '@alfresco/adf-process-services-cloud';
import { FormFieldOption, FormValues } from '@alfresco/adf-core';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PUBLIC_PROCESS_CONFIG } from '../../tokens/process-id.token';

@Injectable({
    providedIn: 'root',
})
export class PublicFormService extends FormCloudService {
    private readonly BASE_API_URL = 'rb/v1/public/processes';
    private readonly DEPLOYED_APPS_KEY = 'alfresco-deployed-apps';
    private readonly PAYLOAD_TYPE = 'StartProcessPayload';
    private readonly processId = inject(PUBLIC_PROCESS_CONFIG).id;
    private destroyRef = inject(DestroyRef);
    private readonly appName = this.appConfigService.get<Record<string, string>[]>(this.DEPLOYED_APPS_KEY, [{ name: '' }])[0]['name'];

    constructor(adfHttpClient: AdfHttpClient) {
        super(adfHttpClient);
    }

    override getRestWidgetData(formId: string, widgetId: string, body: Map<string, string>): Observable<FormFieldOption[]> {
        const apiUrl = `${this.getBasePath(this.appName)}/${this.BASE_API_URL}/${this.processId}/form/${formId}/values/${widgetId}`;
        return this.post(apiUrl, body);
    }

    fetchFormRepresentation(): Observable<Record<'formRepresentation', FormRepresentation>> {
        return this.get<Record<'formRepresentation', FormRepresentation>>(
            `${this.contextRoot}/${this.appName}/${this.BASE_API_URL}/${this.processId}/start-form`
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => throwError(() => error))
        );
    }

    fetchStaticFormValues(): Observable<FormValues> {
        return this.get<FormValues>(`${this.contextRoot}/${this.appName}/${this.BASE_API_URL}/${this.processId}/static-values`).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => throwError(() => error))
        );
    }

    fetchStartEventConstants(): Observable<Record<string, string>> {
        return this.get<Record<string, string>>(`${this.contextRoot}/${this.appName}/${this.BASE_API_URL}/${this.processId}/constant-values`).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => throwError(() => error))
        );
    }

    startProcess(formValues: unknown, outcome: string): Observable<unknown> {
        return this.post(`${this.contextRoot}/${this.appName}/${this.BASE_API_URL}/${this.processId}/form/submit`, {
            payloadType: this.PAYLOAD_TYPE,
            processDefinitionKey: this.processId,
            values: formValues,
            outcome,
        }).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => throwError(() => error))
        );
    }
}
