/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { userAppsMock, userAppsResponseMock } from '../mocks/user-apps.mock';
import { UserAppsService } from './user-apps-list.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppConfigService, LogService, NoopTranslateModule, NotificationService, OAuth2Service } from '@alfresco/adf-core';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('UserAppsService', () => {
    let service: UserAppsService;

    const oAuth2ServiceSpy: OAuth2Service = jasmine.createSpyObj('OAuth2Service', {
        get: of(userAppsResponseMock),
    });
    const appConfigServiceSpy: AppConfigService = jasmine.createSpyObj('AppConfigService', {
        get: 'http://localhost/bpm',
    });
    const notificationServiceSpy: NotificationService = jasmine.createSpyObj('NotificationService', {
        showError: jasmine.createSpy('showError'),
    });
    const logServiceSpy: LogService = jasmine.createSpyObj('LogService', {
        error: jasmine.createSpy('error'),
    });
    const routerSpy: Router = jasmine.createSpyObj('Router', {
        navigate: jasmine.createSpy('navigate'),
    });
    const ENDPOINT_URL = 'http://localhost/bpm/identity-adapter-service/v1/apps/account';

    const configureTestModule = (authSpy: OAuth2Service) => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, MatSnackBarModule, NoopAnimationsModule],
            providers: [
                { provide: LogService, useValue: logServiceSpy },
                { provide: AppConfigService, useValue: appConfigServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: OAuth2Service, useValue: authSpy },
            ],
        });
        service = TestBed.inject(UserAppsService);
    };

    beforeEach(() => {
        (oAuth2ServiceSpy.get as jasmine.Spy).calls.reset();
        (appConfigServiceSpy.get as jasmine.Spy).calls.reset();
        (notificationServiceSpy.showError as jasmine.Spy).calls.reset();
        (logServiceSpy.error as jasmine.Spy).calls.reset();
        (routerSpy.navigate as jasmine.Spy).calls.reset();
    });

    it('should call endpoint and fetch user apps', (done) => {
        configureTestModule(oAuth2ServiceSpy);

        service.getUserAppsData().subscribe((res) => {
            expect(res).toEqual(userAppsMock);
            done();
        });

        expect(oAuth2ServiceSpy.get).toHaveBeenCalledWith({
            url: ENDPOINT_URL,
        });
    });

    it('should call endpoint and fetch user roles', (done) => {
        configureTestModule(oAuth2ServiceSpy);

        service.getCurrentUserRoles$().subscribe((roles) => {
            expect(roles).toEqual(['admin', 'modeler']);
            done();
        });

        expect(oAuth2ServiceSpy.get).toHaveBeenCalledWith({ url: ENDPOINT_URL });
    });

    it('should get base url from app config', (done) => {
        configureTestModule(oAuth2ServiceSpy);

        service.getUserAppsData().subscribe((res) => {
            expect(res).toEqual(userAppsMock);
            done();
        });

        expect(appConfigServiceSpy.get).toHaveBeenCalledWith('bpmHost', '');
    });

    it('should get current appKey from app config', (done) => {
        configureTestModule(oAuth2ServiceSpy);

        service.getUserAppsData().subscribe((res) => {
            expect(res).toEqual(userAppsMock);
            done();
        });

        expect(appConfigServiceSpy.get).toHaveBeenCalledWith('application', {});
    });

    it('should redirect to 403 page when receiving Forbidden error', (done) => {
        const authErrorSpy: OAuth2Service = jasmine.createSpyObj('OAuth2Service', {
            get: throwError({ status: 403 }),
        });

        configureTestModule(authErrorSpy);

        service.getUserAppsData().subscribe({
            next: () => fail('expected an error'),
            complete: () => {
                expect(routerSpy.navigate).toHaveBeenCalledWith(['error', 403]);
                expect(notificationServiceSpy.showError).not.toHaveBeenCalled();
                expect(logServiceSpy.error).toHaveBeenCalled();
                done();
            },
        });
    });

    it('should not redirect to 403 page when receiving error other than Forbidden', (done) => {
        const authErrorSpy: OAuth2Service = jasmine.createSpyObj('OAuth2Service', {
            get: throwError({ status: 404 }),
        });

        configureTestModule(authErrorSpy);

        service.getUserAppsData().subscribe({
            next: () => fail('expected an error'),
            complete: () => {
                expect(routerSpy.navigate).not.toHaveBeenCalled();
                expect(notificationServiceSpy.showError).toHaveBeenCalled();
                expect(logServiceSpy.error).toHaveBeenCalled();
                done();
            },
        });
    });
});
