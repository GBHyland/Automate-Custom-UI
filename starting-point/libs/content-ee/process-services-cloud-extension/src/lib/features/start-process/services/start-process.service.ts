/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, FormFieldModel, FormModel, LogService, NotificationService } from '@alfresco/adf-core';
import { Node, FormDefinitionRepresentation } from '@alfresco/js-api';
import { Observable } from 'rxjs/internal/Observable';
import { map, catchError } from 'rxjs/operators';
import { ReplaySubject, of } from 'rxjs';
import { FormCloudService, ProcessDefinitionCloud, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';

export interface UploadWidget {
    id: string;
    type: string;
}

@Injectable({
    providedIn: 'root',
})
export class StartProcessService {
    static UPLOAD = 'upload';
    static MULTIPLE = 'multiple';
    static SINGLE = 'single';
    selectedNodes$: Observable<Node[]>;
    private selectedNodesSubject = new ReplaySubject<Node[]>(1);

    constructor(
        private readonly formCloudService: FormCloudService,
        private readonly startProcessCloudService: StartProcessCloudService,
        private readonly appConfigService: AppConfigService,
        private readonly logService: LogService,
        private readonly notificationService: NotificationService
    ) {
        this.selectedNodes$ = this.selectedNodesSubject.asObservable();
    }

    getAppName() {
        return this.appConfigService.get('alfresco-deployed-apps')[0].name;
    }

    getDefaultProcessName(): string {
        return this.appConfigService.get<string>('adf-cloud-start-process.name');
    }

    getDefaultProcessDefinitionName(): string {
        return this.appConfigService.get<string>('adf-cloud-start-process.processDefinitionName');
    }

    setSelectedNodes(selectedNodes: Node[]) {
        this.selectedNodesSubject.next(selectedNodes);
    }

    getContentUploadWidgets(processDefinitionName: string): Observable<UploadWidget[]> {
        return this.getStartFormByProcessDefinitionName(processDefinitionName);
    }

    getProcessDefinitions(appName: string): Observable<ProcessDefinitionCloud[]> {
        return this.startProcessCloudService.getProcessDefinitions(appName);
    }

    getFormById(formId: string) {
        const appName = this.getAppName();

        return this.formCloudService.getForm(appName, formId).pipe(
            map((form: any) => {
                const flattenForm = {
                    ...form.formRepresentation,
                    ...form.formRepresentation.formDefinition,
                };
                delete flattenForm.formDefinition;
                return flattenForm;
            })
        );
    }

    showError(message: string) {
        this.notificationService.showWarning(message);
    }

    private getStartFormByProcessDefinitionName(processDefinitionFormKey: string) {
        return this.getFormById(processDefinitionFormKey).pipe(
            map((formDefinition: FormDefinitionRepresentation) => {
                if (!formDefinition.fields) {
                    throw new Error('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
                }

                const formModel = new FormModel(formDefinition);
                const uploadFields = formModel.getFormFields([StartProcessService.UPLOAD]);

                if (uploadFields.length === 0) {
                    this.showError('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
                }

                return this.getUploadWidgetFields(uploadFields);
            }),
            catchError((error) => {
                this.showError('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
                this.logService.error(error);
                return of([]);
            })
        );
    }

    private getUploadWidgetFields(uploadFields: FormFieldModel[]): UploadWidget[] {
        if (uploadFields.length === 0) {
            this.showError('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
        }

        return uploadFields.map(
            (filteredWidget: any) =>
                <UploadWidget>{
                    id: filteredWidget.id,
                    type: filteredWidget.params.multiple ? StartProcessService.MULTIPLE : StartProcessService.SINGLE,
                }
        );
    }
}
