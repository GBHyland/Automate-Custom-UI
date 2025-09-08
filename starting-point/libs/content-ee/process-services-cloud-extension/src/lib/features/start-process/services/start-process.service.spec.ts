/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { AppConfigService, NotificationService, NoopTranslateModule } from '@alfresco/adf-core';
import { FormCloudService } from '@alfresco/adf-process-services-cloud';
import { StartProcessService } from './start-process.service';
import { formWithNoWidgets, formWithUploadWidgets, formWithoutUploadWidgets } from '../mock/start-process.mock';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideMockStore } from '@ngrx/store/testing';

describe('StartProcessService', () => {
    let store: Store<any>;
    let service: StartProcessService;
    let formService: FormCloudService;
    let appConfig: AppConfigService;
    let notificationService: NotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, MatSnackBarModule],
            providers: [provideMockStore()],
        });

        store = TestBed.inject(Store);
        service = TestBed.inject(StartProcessService);
        formService = TestBed.inject(FormCloudService);
        appConfig = TestBed.inject(AppConfigService);
        notificationService = TestBed.inject(NotificationService);
        appConfig.config = Object.assign(appConfig.config, {
            'adf-cloud-start-process.name': 'default-process-name',
            'adf-cloud-start-process.processDefinitionName': 'default-process-definition-name',
            'alfresco-deployed-apps': [{ name: 'mock-app-name' }],
        });

        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();
    });

    it('Should fetch default processName and processDefinition name', () => {
        expect(service.getDefaultProcessName()).toBe('default-process-name');
        expect(service.getDefaultProcessDefinitionName()).toBe('default-process-definition-name');
    });

    it('Should fetch defined appName from app.config json', () => {
        expect(service.getAppName()).toBe('mock-app-name');
    });

    it('Should show warning notification if start form does not have form fields', async () => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithNoWidgets));
        const showWarningSpy = spyOn(notificationService, 'showWarning');
        await service.getContentUploadWidgets('mock-process-def-id').toPromise();

        expect(showWarningSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
    });

    it('Should be able to fetch only upload widgets from the start form', async () => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithUploadWidgets));
        const contentWidgets = await service.getContentUploadWidgets('mock-process-def-id').toPromise();

        expect(contentWidgets.length).toBe(3);
    });

    it('Should show warning notification if start form does not have upload widgets', async () => {
        spyOn(formService, 'getForm').and.returnValue(of(formWithoutUploadWidgets));
        const showWarningSpy = spyOn(notificationService, 'showWarning');
        await service.getContentUploadWidgets('mock-process-def-id').toPromise();

        expect(showWarningSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.ERROR.CAN_NOT_ATTACH');
    });

    it('Should show warning notification if there is no start form', async () => {
        spyOn(formService, 'getForm').and.returnValue(throwError('fake-error'));
        const showWarningSpy = spyOn(notificationService, 'showWarning');
        await service.getContentUploadWidgets('mock-process-def-id').toPromise();

        expect(showWarningSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
    });
});
