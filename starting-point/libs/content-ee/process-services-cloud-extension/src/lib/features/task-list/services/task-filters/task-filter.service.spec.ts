/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { TaskFilterService } from './task-filter.service';
import { TranslateService } from '@ngx-translate/core';
import {
    DateCloudFilterType,
    IdentityUserService,
    ProcessDefinitionCloud,
    TaskCloudService,
    TaskFilterCloudModel,
    TaskFilterCloudService,
} from '@alfresco/adf-process-services-cloud';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectVariablesByProcess } from '../../../../store/selectors/process-definitions.selector';
import { DateFilter, FilterType } from '@alfresco-dbp/shared-filters-services';
import { endOfDay, startOfDay } from 'date-fns';

const mockProcessDefinitions: ProcessDefinitionCloud[] = [
    {
        id: 'mockId',
        appName: 'mockAppName',
        key: 'mockKey',
        appVersion: 1,
        version: 1,
        name: 'mockProcessDefinitionName',
        category: '',
        description: '',
    },
];

const mockTaskFilterCloudModel = new TaskFilterCloudModel({
    id: 'mockId',
    name: 'mockName',
    appName: 'mockAppName',
    taskNames: ['mockTaskName'],
    statuses: ['mockStatus'],
    processDefinitionNames: ['mockProcessDefinitionName'],
    assignees: ['mockAssignee'],
    priorities: [1],
    dueDateType: DateCloudFilterType.TODAY,
    completedDateType: null,
    createdDateType: DateCloudFilterType.TODAY,
    completedByUsers: ['mockCompletedBy'],
});

describe('TaskFilterService', () => {
    let service: TaskFilterService;
    let taskFilterCloudService: TaskFilterCloudService;
    let taskCloudService: TaskCloudService;
    let identityUserService: IdentityUserService;
    let store: MockStore<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockProvider(TranslateService, {
                    instant: (key: string) => key,
                }),
                MockProvider(TaskCloudService, {
                    getProcessDefinitions: () => of(mockProcessDefinitions),
                    priorities: [{ label: '1', key: '1', value: 'mockPriority' }],
                    getPriorityLabel: () => 'mockPriority',
                }),
                MockProvider(TaskFilterCloudService, {
                    isDefaultFilter: () => true,
                    updateFilter: () => of([mockTaskFilterCloudModel]),
                    addFilter: () => of([mockTaskFilterCloudModel]),
                    deleteFilter: () => of([mockTaskFilterCloudModel]),
                }),
                MockProvider(IdentityUserService, {
                    search: (username) => of([{ id: username, username: username }]),
                }),
                provideMockStore(),
            ],
        });

        service = TestBed.inject(TaskFilterService);
        taskFilterCloudService = TestBed.inject(TaskFilterCloudService);
        taskCloudService = TestBed.inject(TaskCloudService);
        identityUserService = TestBed.inject(IdentityUserService);
        store = TestBed.inject(MockStore);
        store.overrideSelector(selectVariablesByProcess, []);
    });

    it('should get filters correctly', async () => {
        const getProcessDefinitionsSpy = spyOn(taskCloudService, 'getProcessDefinitions').and.callThrough();
        const getPriorityLabelSpy = spyOn(taskCloudService, 'getPriorityLabel').and.callThrough();
        const searchSpy = spyOn(identityUserService, 'search').and.callThrough();

        const filters = await service.getFilters(mockTaskFilterCloudModel).pipe(take(1)).toPromise();
        const isLoading = await service.filtersLoading$.pipe(take(1)).toPromise();

        expect(filters.map((f) => f.name)).toEqual([
            'taskNames',
            'statuses',
            'processDefinitionNames',
            'assignees',
            'priorities',
            'dueDateType',
            'completedDateType',
            'createdDateType',
            'completedByUsers',
        ]);
        expect(getProcessDefinitionsSpy).toHaveBeenCalledWith(mockProcessDefinitions[0].appName);
        expect(getPriorityLabelSpy).toHaveBeenCalledWith(parseInt(mockTaskFilterCloudModel.priorities[0] || '', 10));
        expect(searchSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel.assignees[0]);
        expect(searchSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel.completedByUsers[0]);
        expect(isLoading).toBe(false);
    });

    it('should date filters have correct options', async () => {
        const filters = await service.getFilters(mockTaskFilterCloudModel).pipe(take(1)).toPromise();

        const dateFilters = filters.filter((f) => f.type === FilterType.DATE) as DateFilter[];

        expect(dateFilters.length).toBe(3);
        for (const dateFilter of dateFilters) {
            expect(dateFilter.options).toEqual([
                { value: DateCloudFilterType.TODAY, label: 'FILTERS.DATE_FILTER.TODAY' },
                { value: DateCloudFilterType.WEEK, label: 'FILTERS.DATE_FILTER.WEEK' },
                { value: DateCloudFilterType.MONTH, label: 'FILTERS.DATE_FILTER.MONTH' },
                { value: DateCloudFilterType.QUARTER, label: 'FILTERS.DATE_FILTER.QUARTER' },
                { value: DateCloudFilterType.YEAR, label: 'FILTERS.DATE_FILTER.YEAR' },
                { value: DateCloudFilterType.RANGE, label: 'FILTERS.DATE_FILTER.RANGE' },
            ]);
        }
    });

    it('should check if filter is default', () => {
        const isDefaultFilterSpy = spyOn(taskFilterCloudService, 'isDefaultFilter').and.returnValue(true);

        service.isDefaultFilter(mockTaskFilterCloudModel);

        expect(isDefaultFilterSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel.name);
    });

    it('should save filter', async () => {
        const updateFilterSpy = spyOn(taskFilterCloudService, 'updateFilter').and.returnValue(of([mockTaskFilterCloudModel]));

        await service.saveFilter(mockTaskFilterCloudModel).pipe(take(1)).toPromise();

        expect(updateFilterSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel);
    });

    it('should save filter as', async () => {
        const addFilterSpy = spyOn(taskFilterCloudService, 'addFilter').and.returnValue(of([mockTaskFilterCloudModel]));

        await service.saveFilterAs(mockTaskFilterCloudModel, 'mockNewFilterName').pipe(take(1)).toPromise();

        expect(addFilterSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel);
    });

    it('should delete filter', async () => {
        const deleteFilterSpy = spyOn(taskFilterCloudService, 'deleteFilter').and.returnValue(of([mockTaskFilterCloudModel]));

        await service.deleteFilter(mockTaskFilterCloudModel).pipe(take(1)).toPromise();

        expect(deleteFilterSpy).toHaveBeenCalledWith(mockTaskFilterCloudModel);
    });

    it('should convert filter array to task filter cloud', async () => {
        const sourceTaskFilterCloud = mockTaskFilterCloudModel;
        const filters = await service.getFilters(sourceTaskFilterCloud).pipe(take(1)).toPromise();

        const newTaskFilterCloud = service.filterArrayToTaskFilterCloud(sourceTaskFilterCloud, filters);

        expect(newTaskFilterCloud.assignees).toEqual(sourceTaskFilterCloud.assignees);
        expect(newTaskFilterCloud.completedByUsers).toEqual(sourceTaskFilterCloud.completedByUsers);
        expect(newTaskFilterCloud.createdDateType).toEqual(sourceTaskFilterCloud.createdDateType);
        expect(newTaskFilterCloud.dueDateType).toEqual(sourceTaskFilterCloud.dueDateType);
        expect(newTaskFilterCloud.dueDateFrom).toEqual(startOfDay(new Date()).toISOString());
        expect(newTaskFilterCloud.dueDateTo).toEqual(endOfDay(new Date()).toISOString());
        expect(newTaskFilterCloud.priorities).toEqual(sourceTaskFilterCloud.priorities);
        expect(newTaskFilterCloud.processDefinitionNames).toEqual(sourceTaskFilterCloud.processDefinitionNames);
        expect(newTaskFilterCloud.statuses).toEqual(sourceTaskFilterCloud.statuses);
        expect(newTaskFilterCloud.taskNames).toEqual(sourceTaskFilterCloud.taskNames);
        expect(newTaskFilterCloud.completedDateType).toEqual(sourceTaskFilterCloud.completedDateType);
    });
});
