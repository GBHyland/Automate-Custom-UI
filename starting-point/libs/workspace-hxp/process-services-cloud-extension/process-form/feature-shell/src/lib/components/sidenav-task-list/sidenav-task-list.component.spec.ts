/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { TASKS_ROUTE } from '../../constants/extensions.const';
import { SidenavTaskListComponent } from './sidenav-task-list.component';

const initialState = {};

export const mockProcessFilters: any[] = [
    {
        name: 'FakeAllProcesses',
        key: 'FakeAllProcesses',
        icon: 'adjust',
        id: '10',
        status: '',
    },
    {
        name: 'FakeRunningProcesses',
        key: 'FakeRunningProcesses',
        icon: 'inbox',
        id: '11',
        status: 'RUNNING',
    },
    {
        name: 'FakeCompletedProcesses',
        key: 'completed-processes',
        icon: 'done',
        id: '12',
        status: 'COMPLETED',
    },
];

describe('SidenavTaskListComponent', () => {
    let component: SidenavTaskListComponent;
    let fixture: ComponentFixture<SidenavTaskListComponent>;
    let store: MockStore;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, RouterTestingModule.withRoutes([]), SidenavTaskListComponent],
            providers: [
                provideMockStore(initialState),
                {
                    provide: TaskFilterCloudService,
                    useValue: {
                        getTaskNotificationSubscription: () => of({}),
                        getTaskListFilters: () => of([mockProcessFilters]),
                        filterKeyToBeRefreshed$: of(''),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SidenavTaskListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should dispatch action when filter updates', () => {
        const taskOrProcessFilterUpdateSpy = spyOn(store, 'dispatch');
        const filter = 'testProcessFilter';
        const expectedPayload = {
            filterKey: filter,
            canBeRefreshed: true,
            type: '[Process Service Cloud Extension] task or process filter updated',
        };
        component.onUpdatedFilter(filter);
        expect(taskOrProcessFilterUpdateSpy).toHaveBeenCalledWith(expectedPayload);
        expect(component).toBeDefined();
    });

    it('should navigate when clicked on filter', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const navigateSpy = spyOn(router, 'navigate');
        const fakeFilter = { ...mockProcessFilters[0] };
        const expectedQueryParams = { queryParams: { filterId: fakeFilter.id } };

        component.onTaskFilterClick(fakeFilter);
        expect(navigateSpy).toHaveBeenCalledWith([TASKS_ROUTE], expectedQueryParams);
    });

    it('should not navigate when clicked on filter that does not have id', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const fakeFilter = { ...mockProcessFilters[0] };
        fakeFilter.id = null;
        component.onTaskFilterClick(fakeFilter);
        expect(navigateSpy).not.toHaveBeenCalled();
    });
});
