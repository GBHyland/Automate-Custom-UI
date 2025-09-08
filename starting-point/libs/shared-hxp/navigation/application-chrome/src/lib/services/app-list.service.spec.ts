/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppListService } from './app-list.service';
import { NucleusApiService } from './nucleus-api.service';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { mockAppsError, mockFilteredGlobalApps, mockGlobalApps } from '../mocks/services/app-list.service.mock';
import { NotificationService } from '@alfresco/adf-core';
import { DEFAULT_GLOBAL_APPS } from '../constants/default.global-apps.constant';

describe('AppListService', () => {
    let service: AppListService;

    function initTest(response: Observable<any>) {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NucleusApiService,
                    useValue: {
                        fetch: () => response,
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        showError: () => mockAppsError,
                    },
                },
            ],
        });

        service = TestBed.inject(AppListService);
    }

    it('should set globalApps$ to filtered global apps response', async () => {
        initTest(of(mockGlobalApps));
        expect(await firstValueFrom(service.globalApps$)).toEqual(mockFilteredGlobalApps);
    });

    it('should use default global apps if error', async () => {
        initTest(throwError(() => new Error(mockAppsError)));
        expect(await firstValueFrom(service.globalApps$)).toEqual(DEFAULT_GLOBAL_APPS);
    });
});
