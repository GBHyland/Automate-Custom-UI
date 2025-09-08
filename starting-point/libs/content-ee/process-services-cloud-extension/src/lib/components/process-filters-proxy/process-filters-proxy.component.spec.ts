/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFiltersProxyComponent } from './process-filters-proxy.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AppConfigService, AppConfigServiceMock, RedirectAuthService, NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { LocalPreferenceCloudService, PROCESS_FILTERS_SERVICE_TOKEN, ProcessFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { EMPTY, of } from 'rxjs';
import { navigateToProcesses } from '../../store/actions/process-management-filter.actions';
import { mockProcessCloudFilters } from '../mock/cloud-filters.mock';
import { Apollo } from 'apollo-angular';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProcessFiltersProxyComponent', () => {
    let fixture: ComponentFixture<ProcessFiltersProxyComponent>;
    const apolloMock = jasmine.createSpyObj('Apollo', ['use', 'createNamed']);

    let store: Store<any>;
    let processFilterCloudService: ProcessFilterCloudService;
    let appConfigService: AppConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAuthModule, ProcessFiltersProxyComponent],
            providers: [
                provideMockStore(),
                {
                    provide: Apollo,
                    useValue: apolloMock,
                },
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                { provide: PROCESS_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService },
                { provide: RedirectAuthService, useValue: { onLogin: EMPTY, onTokenReceived: of(), init: () => {} } },
            ],
        });

        fixture = TestBed.createComponent(ProcessFiltersProxyComponent);
        store = TestBed.inject(Store);
        processFilterCloudService = TestBed.inject(ProcessFilterCloudService);

        appConfigService = TestBed.inject(AppConfigService);
        appConfigService.config = Object.assign(appConfigService.config, {
            'alfresco-deployed-apps': [{ name: 'mockApp' }],
        });
    });

    it('should navigate to the first process filter', () => {
        spyOn(processFilterCloudService, 'getProcessFilters').and.returnValue(of(mockProcessCloudFilters));
        const dispatchSpy = spyOn(store, 'dispatch');
        const expectedAction = navigateToProcesses({ filterId: '14' });
        fixture.detectChanges();

        expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
    });

    it('should get the app name from app config deployed apps to fetch the filters', () => {
        const getProcessFiltersSpy = spyOn(processFilterCloudService, 'getProcessFilters').and.returnValue(of([]));
        fixture.detectChanges();

        expect(getProcessFiltersSpy).toHaveBeenCalledWith('mockApp');
    });
});
