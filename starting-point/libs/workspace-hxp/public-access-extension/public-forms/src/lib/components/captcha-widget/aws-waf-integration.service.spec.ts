/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AwsWafIntegrationService } from './aws-waf-integration.service';
import { MockProvider } from 'ng-mocks';
import { AppConfigService } from '@alfresco/adf-core';
import { AwsWafJSIntegrations } from './aws-waf-integration.types';

declare const window: Window & AwsWafJSIntegrations;

function setMockWindow(): void {
    window.AwsWafIntegration = { hasToken: jest.fn().mockReturnValue(true), getToken: jest.fn().mockReturnValue('mock-token'), fetch: jest.fn() };
    window.AwsWafCaptcha = { renderCaptcha: jest.fn() };
}

describe('AwsWafIntegrationService', () => {
    let service: AwsWafIntegrationService;
    let mockCaptchaConfig: { integrationUrl: any; apiKey?: string };

    beforeEach(() => {
        mockCaptchaConfig = {
            integrationUrl: 'https://mockawsintegration.com/',
            apiKey: 'mock-api-key',
        };

        TestBed.configureTestingModule({
            providers: [
                AwsWafIntegrationService,
                MockProvider(AppConfigService, {
                    get: jest.fn().mockImplementation((param) => {
                        if (param === 'aws.captcha.integrationUrl') {
                            return mockCaptchaConfig.integrationUrl;
                        } else if (param === 'aws.captcha.apiKey') {
                            return mockCaptchaConfig.apiKey;
                        }
                    }),
                }),
            ],
        });

        service = TestBed.inject(AwsWafIntegrationService);

        setMockWindow();
    });

    describe('loadWafIntegration', () => {
        let importSpy: jest.Mock;

        beforeEach(() => {
            importSpy = jest.fn();

            jest.mock(
                'https://mockawsintegration.com/jsapi.js',
                () => {
                    importSpy();
                    setMockWindow();
                },
                { virtual: true }
            );
        });

        it('should load WAF integration if not already loaded', async () => {
            window.AwsWafIntegration = window.AwsWafCaptcha = undefined as any;
            await service.loadWafIntegration();

            expect(importSpy).toHaveBeenCalled();
        });

        it('should not load WAF integration if already loaded', async () => {
            await service.loadWafIntegration();

            expect(importSpy).not.toHaveBeenCalled();
        });

        it('should throw error if integration URL is invalid', async () => {
            window.AwsWafIntegration = window.AwsWafCaptcha = undefined as any;
            mockCaptchaConfig.integrationUrl = 'mock-integration-url';

            await expect(service.loadWafIntegration()).rejects.toThrow('Invalid AWS WAF Captcha Integration URL');
        });
    });

    describe('hasValidWafToken', () => {
        it('should return true if token is valid', async () => {
            const result = await service.hasValidWafToken();

            expect(result).toBe(true);
        });

        it('should return false if token is invalid', async () => {
            window.AwsWafIntegration.hasToken = jest.fn().mockReturnValue(false);

            const result = await service.hasValidWafToken();

            expect(result).toBe(false);
        });

        it('should call loadWafIntegration if not loaded', async () => {
            window.AwsWafIntegration = window.AwsWafCaptcha = undefined as any;
            spyOn(service, 'loadWafIntegration').and.callFake(() => setMockWindow());

            await service.hasValidWafToken();

            expect(service.loadWafIntegration).toHaveBeenCalled();
        });
    });

    describe('attachCaptchaBox', () => {
        it('should render captcha box', async () => {
            const container = document.createElement('div');
            const options = { onSuccess: jest.fn(), onPuzzleCorrect: jest.fn(), onError: jest.fn() };

            await service.attachCaptchaBox(container, options);

            expect(window.AwsWafCaptcha.renderCaptcha).toHaveBeenCalledWith(container, { ...options, apiKey: 'mock-api-key' });
        });

        it('should throw error if the captcha api key is missing', async () => {
            mockCaptchaConfig.apiKey = undefined;
            const container = document.createElement('div');
            const options = { onSuccess: jest.fn(), onPuzzleCorrect: jest.fn(), onError: jest.fn() };

            await expect(service.attachCaptchaBox(container, options)).rejects.toThrow('Missing AWS WAF Captcha API Key');
        });

        it('should load captcha integration if not already loaded', async () => {
            window.AwsWafCaptcha = undefined as any;
            spyOn(service, 'loadWafIntegration').and.callFake(() => setMockWindow());
            const container = document.createElement('div');
            const options = { onSuccess: jest.fn(), onPuzzleCorrect: jest.fn(), onError: jest.fn() };

            await service.attachCaptchaBox(container, options);

            expect(service.loadWafIntegration).toHaveBeenCalled();
        });
    });
});
