/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { of, throwError } from 'rxjs';
import { PublicFormComponent } from './public-form.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormCloudComponent } from '@alfresco/adf-process-services-cloud';
import { AppConfigService, NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { mockFormRepresentationWithOutcome, mockFormRepresentationWithNoOutcome } from './form-representation.mock';
import { ActivatedRoute } from '@angular/router';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { MockProvider } from 'ng-mocks';
import { AwsWafIntegrationService } from '../captcha-widget/aws-waf-integration.service';
import { PUBLIC_PROCESS_CONFIG } from '../../tokens/process-id.token';
import { PublicFormRedirectionService } from '../../services/public-form-redirection.service';

describe('PublicFormComponent', () => {
    let fixture: ComponentFixture<PublicFormComponent>;
    let component: PublicFormComponent;
    let wafService: AwsWafIntegrationService;
    let redirectionService: PublicFormRedirectionService;
    describe('With outcome', () => {
        const mockRequest = jest.fn().mockImplementation((url) => {
            if (url.includes('start-form')) {
                return of(mockFormRepresentationWithOutcome);
            } else if (url.includes('static-values')) {
                return of({ Text0y1hh7: 'fake-static-value' });
            } else if (url.includes('form/submit')) {
                return of({});
            } else if (url.includes('constant-values')) {
                return of({ cancelEnabled: 'false', startProcessEnabled: 'true' });
            }
            return of({});
        });
        const notificationServiceMock = { showSuccess: jest.fn(), showError: jest.fn() };

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NoopTranslateModule, FormCloudComponent, NoopAnimationsModule, HttpClientTestingModule, MatProgressSpinnerModule],
                providers: [
                    { provide: AdfHttpClient, useValue: { request: mockRequest } },
                    { provide: HxpNotificationService, useValue: notificationServiceMock },
                    {
                        provide: ActivatedRoute,
                        useValue: { params: of({ processId: 'testProcessId' }) },
                    },
                    {
                        provide: PUBLIC_PROCESS_CONFIG,
                        useValue: { id: 'testProcessId' },
                    },
                    {
                        provide: AppConfigService,
                        useValue: {
                            get: (key: string) => {
                                if (key === 'bpmHost') {
                                    return 'https://mock-hyland.com';
                                } else if (key === 'alfresco-deployed-apps') {
                                    return [{ name: 'mock-appName' }];
                                }
                                return '';
                            },
                        },
                    },
                    MockProvider(AwsWafIntegrationService, {
                        hasValidWafToken: jest.fn().mockImplementation(() => Promise.resolve(true)),
                        showCaptcha: jest.fn(),
                    }),
                    MockProvider(PublicFormRedirectionService, {
                        redirect: jest.fn(),
                        redirectToError: jest.fn(),
                    }),
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PublicFormComponent);
            component = fixture.componentInstance;
            wafService = TestBed.inject(AwsWafIntegrationService);
            redirectionService = TestBed.inject(PublicFormRedirectionService);

            fixture.detectChanges();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should set loading to false', () => {
            expect(component.loading).toBeFalsy();
        });

        it('should show success notification when form loaded', () => {
            expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('APP.PUBLIC_FORM.SUCCESS.LOADING_FORM');
        });

        it('should populate form fields with static form values', () => {
            fixture.detectChanges();
            expect(mockRequest).toHaveBeenCalledWith(
                `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/static-values`,
                expect.anything()
            );

            expect(component.form.values).toEqual({ Text0y1hh7: 'fake-static-value' });
        });

        it('should call right endpoint to get FormRepresentation', () => {
            expect(mockRequest).toHaveBeenCalledWith(
                `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/start-form`,
                expect.anything()
            );
        });

        it('should start process with outcome when custom outcome was clicked', () => {
            component.onOutcomeClicked('Custom Action');

            expect(component.outcome).toEqual('Custom Action');

            component.startProcess();

            expect(mockRequest).toHaveBeenCalledWith(
                `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/form/submit`,
                expect.objectContaining({
                    bodyParam: {
                        payloadType: 'StartProcessPayload',
                        processDefinitionKey: 'testProcessId',
                        values: { Text0y1hh7: 'fake-static-value' },
                        outcome: 'Custom Action',
                    },
                })
            );
        });

        it('should call redirection service process started', () => {
            component.startProcess();

            expect(redirectionService.redirect).toHaveBeenCalled();
        });

        it('should redirect to error page when process failed to start', () => {
            mockRequest.mockReturnValueOnce(throwError(() => new Error('error')));

            component.startProcess();

            expect(redirectionService.redirectToError).toHaveBeenCalledWith(500);
        });

        it('should display form outcomes', () => {
            const option1 = fixture.debugElement.query(By.css('#adf-form-option_1'));
            const option2 = fixture.debugElement.query(By.css('#adf-form-option_2'));

            expect(option1.nativeElement.textContent).toContain('OPTION 1');
            expect(option2.nativeElement.textContent).toContain('OPTION 2');
        });

        it('should NOT display START PROCESS button when at least one outcome provided by user', () => {
            const startButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-start-button"]'));

            expect(startButton).toBeNull();
        });

        it('should redirect to error page when form failed to load', () => {
            mockRequest.mockReturnValueOnce(throwError(() => new Error('error')));
            component.ngOnInit();
            fixture.detectChanges();

            expect(redirectionService.redirectToError).toHaveBeenCalledWith(404);
        });

        it('should go back when cancel button clicked', () => {
            const location = TestBed.inject(Location);
            const locationBackSpy = jest.spyOn(location, 'back');

            component.cancelStartProcess();

            expect(locationBackSpy).toHaveBeenCalled();
        });

        it('should NOT display CANCEL button when it is disabled', () => {
            const cancelButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-cancel-button"]'));

            expect(cancelButton).toBeNull();
        });

        describe('captcha widget', () => {
            it('should show captcha and make form readonly on start process', () => {
                component.showSubmissionCaptcha();

                expect(wafService.showCaptcha).toHaveBeenCalled();
                expect(component.form.readOnly).toBe(true);
            });

            it('should show captcha and make form readonly on custom outcome', () => {
                component.onOutcomeClicked('Custom Action');

                expect(wafService.showCaptcha).toHaveBeenCalled();
                expect(component.form.readOnly).toBe(true);
            });

            it('should make form editable on captcha cancel', () => {
                component.showSubmissionCaptcha();

                component.handleCaptchaCanceled();

                expect(component.form.readOnly).toBe(false);
                expect(component.captchaInProgress).toBe(false);
            });

            it('should show error and make form editable on captcha error', () => {
                component.showSubmissionCaptcha();

                component.handleCaptchaError();

                expect(notificationServiceMock.showError).toHaveBeenCalledWith('APP.PUBLIC_FORM.ERROR.CAPTCHA');
                expect(component.form.readOnly).toBe(false);
                expect(component.captchaInProgress).toBe(false);
            });
        });
    });

    describe('Without outcome', () => {
        const mockRequest = jest.fn().mockImplementation((url) => {
            if (url.includes('start-form')) {
                return of(mockFormRepresentationWithNoOutcome);
            } else if (url.includes('static-values')) {
                return of({});
            } else if (url.includes('form/submit')) {
                return of({});
            } else if (url.includes('constant-values')) {
                return of({ cancelEnabled: 'true', startProcessEnabled: 'true', cancelLabel: 'Custom Cancel', startLabel: 'Custom Start' });
            }
            return of({});
        });
        const notificationServiceMock = { showSuccess: jest.fn(), showError: jest.fn() };

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NoopTranslateModule, FormCloudComponent, NoopAnimationsModule, HttpClientTestingModule, MatProgressSpinnerModule],
                providers: [
                    { provide: AdfHttpClient, useValue: { request: mockRequest } },
                    { provide: HxpNotificationService, useValue: notificationServiceMock },
                    {
                        provide: ActivatedRoute,
                        useValue: { params: of({ processId: 'testProcessId' }) },
                    },
                    {
                        provide: PUBLIC_PROCESS_CONFIG,
                        useValue: { id: 'testProcessId' },
                    },
                    {
                        provide: AppConfigService,
                        useValue: {
                            get: (key: string) => {
                                if (key === 'bpmHost') {
                                    return 'https://mock-hyland.com';
                                } else if (key === 'alfresco-deployed-apps') {
                                    return [{ name: 'mock-appName' }];
                                }
                                return '';
                            },
                        },
                    },

                    MockProvider(PublicFormRedirectionService, {
                        redirectToError: jest.fn(),
                    }),
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PublicFormComponent);
            fixture.detectChanges();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should display Custom Start button', () => {
            const startButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-start-button"]'));

            expect(startButton).not.toBeNull();
            expect(startButton.nativeElement.textContent.trim()).toEqual('Custom Start');
        });

        it('should display Custom CANCEL button', () => {
            const cancelButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-cancel-button"]'));

            expect(cancelButton).not.toBeNull();
            expect(cancelButton.nativeElement.textContent.trim()).toEqual('Custom Cancel');
        });
    });
});
