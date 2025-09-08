/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PublicFormRedirectionService } from './public-form-redirection.service';
import { TaskRedirectionMode, TaskRedirectionConstants, TaskRedirectionConfig } from '@alfresco/adf-process-services-cloud-extension';
import { DOCUMENT } from '@angular/common';

describe('PublicFormRedirectionService', () => {
    let service: PublicFormRedirectionService;
    let routerSpy: any;
    let windowMock: any;
    let activatedRouteMock: any;

    beforeEach(() => {
        routerSpy = { navigate: jest.fn() };
        windowMock = { location: { href: '' } };
        activatedRouteMock = {};

        TestBed.configureTestingModule({
            providers: [
                PublicFormRedirectionService,
                { provide: Router, useValue: routerSpy },
                {
                    provide: DOCUMENT,
                    useValue: {
                        defaultView: windowMock,
                    },
                },
            ],
        });
        service = TestBed.inject(PublicFormRedirectionService);
    });

    describe('extractRedirectionConstants', () => {
        it('should extract valid constants', () => {
            const constants = {
                [TaskRedirectionConstants.REDIRECTION_MODE]: TaskRedirectionMode.URL,
                [TaskRedirectionConstants.REDIRECTION_PARAMETER]: 'http://test',
            };
            const result = service.extractRedirectionConstants(constants);
            expect(result.redirectionMode).toBe(TaskRedirectionMode.URL);
            expect(result.redirectionParameter).toBe('http://test');
        });

        it('should fallback to default mode if invalid', () => {
            const constants = {
                [TaskRedirectionConstants.REDIRECTION_MODE]: 'INVALID',
                [TaskRedirectionConstants.REDIRECTION_PARAMETER]: 'param',
            };
            const result = service.extractRedirectionConstants(constants);
            expect(result.redirectionMode).toBe(TaskRedirectionMode.SUCCESS);
        });
    });

    describe('redirect', () => {
        it('should redirect to URL if mode is URL and parameter exists', () => {
            const config: TaskRedirectionConfig = {
                redirectionMode: TaskRedirectionMode.URL,
                redirectionParameter: 'http://redirect',
            };
            service.redirect(config, activatedRouteMock);
            expect(windowMock.location.href).toBe('http://redirect');
        });

        it('should redirect to success if mode is URL and parameter does not exist', () => {
            const config: TaskRedirectionConfig = {
                redirectionMode: TaskRedirectionMode.URL,
                redirectionParameter: null as any,
            };
            service.redirect(config, activatedRouteMock);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['./success'], {
                state: { outcome: 'submitted' },
                relativeTo: activatedRouteMock,
            });
        });
    });

    describe('redirectToError', () => {
        it('should navigate to error page', async () => {
            await service.redirectToError(404);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/public/error', 404]);
        });

        it('should navigate to error page without error code', async () => {
            await service.redirectToError(undefined as any);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/public/error']);
        });
    });
});
