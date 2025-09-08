/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { ProcessFiltersCloudExtComponent } from './process-filters-cloud-ext.component';
import { fakeProcessCloudFilter } from '../../mock/process-filter.mock';
import { FilterType } from '../../../../store/states/extension.state';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { Apollo } from 'apollo-angular';

describe('ProcessFiltersCloudExtComponent', () => {
    let component: ProcessFiltersCloudExtComponent;
    let fixture: ComponentFixture<ProcessFiltersCloudExtComponent>;
    let store: Store<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesCloudModule.forRoot(), NoopAuthModule, NoopTranslateModule, ProcessFiltersCloudExtComponent],
            providers: [
                Apollo,
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectApplicationName) {
                                return of('mock-appName');
                            }
                            return of({});
                        },
                        dispatch: () => {},
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(ProcessFiltersCloudExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('Should dispatch a navigateToFilterAction on click of process filter', () => {
        const navigateToProcessActionSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            filterId: fakeProcessCloudFilter.id,
            type: '[ProcessCloud] navigateToProcesses',
        };
        component.onProcessFilterClick(fakeProcessCloudFilter);
        expect(navigateToProcessActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should dispatch a setProcessManagementFilter on click of process filter', () => {
        const setProcessManagementFilterSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            payload: {
                filter: fakeProcessCloudFilter,
                type: FilterType.PROCESS,
            },
            type: '[ProcessCloud] setProcessManagementFilter',
        };
        component.onProcessFilterClick(fakeProcessCloudFilter);
        expect(setProcessManagementFilterSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should dispatch a taskOrProcessFilterUpdate when filter has been updated', () => {
        const taskOrProcessFilterUpdateSpy = spyOn(store, 'dispatch');
        const filter = 'testProcessFilter';
        const expectedPayload = {
            filterKey: filter,
            canBeRefreshed: true,
            type: '[Process Service Cloud Extension] task or process filter updated',
        };

        component.onUpdatedFilter(filter);

        expect(taskOrProcessFilterUpdateSpy).toHaveBeenCalledWith(expectedPayload);
    });
});
