/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';

import { CustomAuthStoragePrefixService } from './custom-auth-storage-prefix.service';
import { AppConfigService } from '@alfresco/adf-core';
import { of } from 'rxjs';

describe('CustomAuthStoragePrefixService', () => {
    let service: CustomAuthStoragePrefixService;

    const createAppConfigServiceSpy = () => {
        const mockDeployedApps = [{ name: 'testApp' }];
        const mockUiType = 'testUiType';
        const appConfigServiceSpy = {
            select: jest.fn((key: string) => {
                if (key === 'alfresco-deployed-apps') {
                    return of(mockDeployedApps);
                } else if (key === 'uiType') {
                    return of(mockUiType);
                }
                return of(null);
            }),
        } as any;
        return appConfigServiceSpy;
    };

    beforeEach(() => {
        const appConfigServiceSpy = createAppConfigServiceSpy();

        TestBed.configureTestingModule({
            providers: [CustomAuthStoragePrefixService, { provide: AppConfigService, useValue: appConfigServiceSpy }],
        });

        service = TestBed.inject(CustomAuthStoragePrefixService);
    });

    it('should load authentication storage prefix', async () => {
        expect(service.prefix).toBe('testApp_testUiType_');
    });
});
