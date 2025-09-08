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
import { TaskFiltersCloudExtComponent } from './task-filters-cloud-ext.component';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { fakeTaskFilter } from '../../mock/task-filter.mock';
import { FilterType } from '../../../../store/states/extension.state';
import { NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { Apollo } from 'apollo-angular';

describe('TaskFiltersCloudExtComponent', () => {
    let component: TaskFiltersCloudExtComponent;
    let fixture: ComponentFixture<TaskFiltersCloudExtComponent>;
    let store: Store<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessServicesCloudModule.forRoot(), NoopAuthModule, NoopTranslateModule, TaskFiltersCloudExtComponent],
            providers: [
                Apollo,
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectApplicationName) {
                                return of('mock-appName');
                            } else if (selector === selectProcessManagementFilter) {
                                return of([]);
                            }
                            return of({});
                        },
                        dispatch: () => {},
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(TaskFiltersCloudExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        component.appName$ = of('mock-appName');
        fixture.detectChanges();
    });

    it('Should dispatch a navigateToFilterAction on click of task filter', () => {
        const navigateToFilterActionSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            filterId: fakeTaskFilter.id,
            type: '[ProcessCloud] navigateToTasks',
        };
        component.onTaskFilterClick(fakeTaskFilter);

        expect(navigateToFilterActionSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should dispatch a setProcessManagementFilter action on click of task filter', () => {
        const setProcessManagementFilterSpy = spyOn(store, 'dispatch');
        const expectedPayload = {
            payload: { filter: fakeTaskFilter, type: FilterType.TASK },
            type: '[ProcessCloud] setProcessManagementFilter',
        };
        component.onTaskFilterClick(fakeTaskFilter);

        expect(setProcessManagementFilterSpy).toHaveBeenCalledWith(expectedPayload);
    });

    it('Should dispatch a taskOrProcessFilterUpdate when filter has been updated', () => {
        const taskOrProcessFilterUpdateSpy = spyOn(store, 'dispatch');
        const filter = 'testFilter';
        const expectedPayload = {
            filterKey: filter,
            canBeRefreshed: true,
            type: '[Process Service Cloud Extension] task or process filter updated',
        };
        component.onUpdatedFilter(filter);

        expect(taskOrProcessFilterUpdateSpy).toHaveBeenCalledWith(expectedPayload);
    });
});
