/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, AppConfigServiceMock, RedirectAuthService } from '@alfresco/adf-core';
import { PendoService } from './pendo.service';
import { EMPTY, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

describe('PendoService', () => {
    const applicationNameMock = 'alfresco-adf-application';
    const clientNameMock = 'client-test-name';
    let service: PendoService;
    let appConfig: AppConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                { provide: RedirectAuthService, useValue: { onLogin: EMPTY, onTokenReceived: of() } },
            ],
        });
        service = TestBed.inject(PendoService);
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, {
            'analytics.pendo.key': '1qaz-2wsx',
        });
    });

    it('should initialize pendo service', () => {
        const mockScript = window.document.createElement('script');
        window.document.body.appendChild(mockScript);
        service.injectPendoJS();
        expect((window as any).pendo).toBeTruthy();
    });

    it('should sanitize URL', () => {
        const sanitizePaths = ['search'];
        const url1 = 'http://xyx.com';
        const url2 = 'http://xyx.com/random-path/';
        const url3 = 'http://xyx.com/random-path/query';
        const url4 = 'http://xyx.com/random-path/query?';
        const url5 = 'http://xyx.com/random-path/query?user-name=test-name';
        const url6 = 'http://xyx.com/random-path/search';
        const url7 = 'http://xyx.com/random-path/search;user-name=test-name';
        const url8 = 'http://xyx.com/random-path/search?user-name=test-name';
        const url9 = 'http://xyx.com/random-path/random/search=user-name=test-name';
        const url10 = 'http://xyx.com/random-path/random/search=user-name=test-name?query=test';
        const url11 = 'http://xyx.com/random-path/random?query=test';

        expect(service.sanitize(url1, [])).toBe(url1);
        expect(service.sanitize(url10, [])).toBe(url9);

        expect(service.sanitize(url1, sanitizePaths)).toBe(url1);
        expect(service.sanitize(url2, sanitizePaths)).toBe(url2);
        expect(service.sanitize(url4, sanitizePaths)).toBe(url3);
        expect(service.sanitize(url5, sanitizePaths)).toBe(url3);
        expect(service.sanitize(url6, sanitizePaths)).toBe(url6);
        expect(service.sanitize(url7, sanitizePaths)).toBe(url6);
        expect(service.sanitize(url8, sanitizePaths)).toBe(url6);
        expect(service.sanitize(url9, sanitizePaths)).toBe('http://xyx.com/random-path/random/search');
        expect(service.sanitize(url10, sanitizePaths)).toBe('http://xyx.com/random-path/random/search');
        expect(service.sanitize(url11, sanitizePaths)).toBe('http://xyx.com/random-path/random');
    });

    it('should check if pendo is enabled depends on key', () => {
        const undefinedKey = undefined;
        const pendoMissing = { pendo: undefined };
        const pendoEnabled = { pendo: { enabled: true } };
        const pendoEnabledString = { pendo: { enabled: 'true' } };
        const randomKey = { pendo: { enabled: '${RANDOM_KEY}' } };
        expect(service.isPendoEnabled(undefinedKey)).toBeFalsy();
        expect(service.isPendoEnabled(pendoMissing)).toBeFalsy();
        expect(service.isPendoEnabled({})).toBeFalsy();
        expect(service.isPendoEnabled(pendoEnabled)).toBeFalsy();
        expect(service.isPendoEnabled(randomKey)).toBeFalsy();
        expect(service.isPendoEnabled(pendoEnabledString)).toBeTruthy();
    });

    it('should generate sha for username', async () => {
        const mockUSerName = 'randomUserName';
        const sha = await service.hashUserName(mockUSerName);
        expect(crypto.subtle.digest).toHaveBeenCalled();
        expect(sha).toBe('0000000000000000000000000000000000000000000000000000000000000000');
    });

    it('should get accountID from empty storage', () => {
        expect(service.getAccountId()).toBe(applicationNameMock);
    });

    it('should get accountID application name set', () => {
        appConfig.config = {};
        expect(service.getAccountId()).toBeUndefined();
    });

    it('should get accountID client name set', () => {
        appConfig.config = Object.assign(
            {},
            {
                'customer.name': clientNameMock,
            }
        );
        expect(service.getAccountId()).toBe(clientNameMock);
    });

    it('should get accountID with applications and client names set', () => {
        appConfig.config = Object.assign(
            {},
            {
                'application.name': applicationNameMock,
                'customer.name': clientNameMock,
            }
        );
        expect(service.getAccountId()).toBe(clientNameMock);
    });
});
