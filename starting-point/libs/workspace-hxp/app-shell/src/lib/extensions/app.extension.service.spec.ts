/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, AppConfigServiceMock } from '@alfresco/adf-core';
import { AppExtensionService } from './app.extension.service';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppExtensionService', () => {
    let appConfigService: AppConfigService;
    let appExtensionService: AppExtensionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AppExtensionService, provideMockStore({}), { provide: AppConfigService, useClass: AppConfigServiceMock }],
        });
        appConfigService = TestBed.inject(AppConfigService);
        appExtensionService = TestBed.inject(AppExtensionService);
        localStorage.clear();
    });

    function updateContentServicesPluginAppConfig(enabled: boolean) {
        appExtensionService.updateContentServicePluginAvailability();
        appConfigService.config = Object.assign(appConfigService.config, { plugins: { contentService: enabled } });
        appConfigService.load();
    }

    it('should set contentService in local storage from false to true when contentService plugin is enabled in app config json', () => {
        localStorage.setItem('contentService', 'false');
        updateContentServicesPluginAppConfig(true);

        expect(localStorage.getItem('contentService')).toEqual('true');
    });

    it('should set contentService in local storage to true when it is not present in local storage', () => {
        updateContentServicesPluginAppConfig(true);

        expect(localStorage.getItem('contentService')).toEqual('true');
    });

    it('should set contentService in local storage from true to false when contentService plugin is disabled in app config json', () => {
        localStorage.setItem('contentService', 'true');
        updateContentServicesPluginAppConfig(false);

        expect(localStorage.getItem('contentService')).toEqual('false');
    });
});
