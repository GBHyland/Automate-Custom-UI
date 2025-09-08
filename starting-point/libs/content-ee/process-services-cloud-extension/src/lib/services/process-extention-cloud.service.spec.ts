/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ProcessExtensionServiceCloud } from './process-extension-cloud.service';
import { AppConfigService, AuthenticationService, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { AlfrescoApiService, AlfrescoApiServiceMock } from '@alfresco/adf-content-services';
import { ProcessServiceCloudMainState } from '../store/states/state';
import { AppSubscriptionService } from './app-subscription.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { Apollo } from 'apollo-angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProcessExtensionServiceCloud', () => {
    let store: Store<ProcessServiceCloudMainState>;
    let service: ProcessExtensionServiceCloud;
    let appConfig: AppConfigService;
    let alfrescoApiService: AlfrescoApiService = null;
    let appSubscriptionService: AppSubscriptionService;
    let adfHttpClient: AdfHttpClient;
    let requestSpy: jasmine.Spy;
    const apolloMock = jasmine.createSpyObj('Apollo', ['use', 'createNamed']);

    const mockGoodHealthResponse = Promise.resolve({ status: 'UP' });

    const mockBadHealthResponse = Promise.resolve({ status: 'DOWN' });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule, NoopAuthModule],
            providers: [
                {
                    provide: Apollo,
                    useValue: apolloMock,
                },
                provideMockStore(),
                { provide: AlfrescoApiService, useClass: AlfrescoApiServiceMock },
                { provide: AuthenticationService, useValue: { getToken: () => 'fake token' } },
            ],
        });

        service = TestBed.inject(ProcessExtensionServiceCloud);
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        appConfig = TestBed.inject(AppConfigService);
        appSubscriptionService = TestBed.inject(AppSubscriptionService);
        appConfig.config = Object.assign(appConfig.config, {
            'alfresco-deployed-apps.name': 'simple-app',
            totalQuickStartProcessDefinitions: 5,
            'alfresco-deployed-apps': [
                {
                    name: 'mock-app-name',
                },
            ],
        });
        store = TestBed.inject(Store);
        adfHttpClient = TestBed.inject(AdfHttpClient);
        requestSpy = spyOn(adfHttpClient, 'request');
        spyOn(store, 'select').and.returnValue(of({}));
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(appSubscriptionService, 'initAppNotifications');
        appConfig.load();
        appConfig.onLoad = of(appConfig.config);
    });

    it('Should fetch totalQuickStartProcessDefinitions', () => {
        expect(service.getTotalQuickStartProcessDefinitions()).toBe(5);
    });

    it('Should be able to call health check api if alfrescoApi is Initialized', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => done());
        expect(requestSpy).toHaveBeenCalled();
    });

    it('Should not be able to call health check api if alfrescoApi is not Initialized', () => {
        alfrescoApiService.alfrescoApiInitialized.next(false);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => {});
        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('Should check processServicesCloudRunning is true if backend health status is UP', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(true);
            expect(service.processServicesCloudRunning).toEqual(true);
            done();
        });
    });

    it('Should check processServicesCloudRunning is false if backend health status is DOWN', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockBadHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(false);
            expect(service.processServicesCloudRunning).toEqual(false);
            done();
        });
    });
});
