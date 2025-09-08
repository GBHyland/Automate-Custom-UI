/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ProcessFilterService } from './process-filter.service';
import { TranslateService } from '@ngx-translate/core';
import {
    DateCloudFilterType,
    IdentityUserService,
    ProcessDefinitionCloud,
    ProcessCloudService,
    ProcessFilterCloudModel,
    ProcessFilterCloudService,
    DateRangeFilterService,
} from '@alfresco/adf-process-services-cloud';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectVariablesByProcess } from '../../../../store/selectors/process-definitions.selector';

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

const mockProcessFilterCloudModel = new ProcessFilterCloudModel({
    id: 'mockId',
    name: 'mockName',
    appName: 'mockAppName',
    statuses: ['mockStatus'],
    appVersions: ['1'],
    processDefinitionNames: ['mockProcessDefinitionName'],
    initiators: ['mockInitiator'],
    suspendedDateType: DateCloudFilterType.TODAY,
    completedDateType: DateCloudFilterType.TODAY,
    startedDateType: DateCloudFilterType.TODAY,
});

describe('ProcessFilterService', () => {
    let service: ProcessFilterService;
    let processFilterCloudService: ProcessFilterCloudService;
    let processCloudService: ProcessCloudService;
    let identityUserService: IdentityUserService;
    let store: MockStore<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockProvider(TranslateService, {
                    instant: (key: string) => key,
                }),
                MockProvider(ProcessCloudService, {
                    getProcessDefinitions: () => of(mockProcessDefinitions),
                    getApplicationVersions: () =>
                        of([
                            {
                                entry: {
                                    id: 'mockId',
                                    name: 'mockName',
                                    version: '1',
                                },
                            },
                        ]),
                }),
                MockProvider(ProcessFilterCloudService, {
                    isDefaultFilter: () => true,
                    updateFilter: () => of([mockProcessFilterCloudModel]),
                    addFilter: () => of([mockProcessFilterCloudModel]),
                    deleteFilter: () => of([mockProcessFilterCloudModel]),
                }),
                MockProvider(IdentityUserService, {
                    search: (username) => of([{ id: username, username: username }]),
                }),
                provideMockStore(),
                DateRangeFilterService,
            ],
        });

        service = TestBed.inject(ProcessFilterService);
        processFilterCloudService = TestBed.inject(ProcessFilterCloudService);
        processCloudService = TestBed.inject(ProcessCloudService);
        identityUserService = TestBed.inject(IdentityUserService);

        store = TestBed.inject(MockStore);
        store.overrideSelector(selectVariablesByProcess, []);
    });

    it('should get filters correctly', async () => {
        const getProcessDefinitionsSpy = spyOn(processCloudService, 'getProcessDefinitions').and.callThrough();
        const getApplicationVersionsSpy = spyOn(processCloudService, 'getApplicationVersions').and.callThrough();
        const searchSpy = spyOn(identityUserService, 'search').and.callThrough();

        const filters = await service.getFilters(mockProcessFilterCloudModel).pipe(take(1)).toPromise();
        const isLoading = await service.filtersLoading$.pipe(take(1)).toPromise();

        expect(filters.map((f) => f.name)).toEqual([
            'appVersions',
            'statuses',
            'processDefinitionNames',
            'processNames',
            'initiators',
            'suspendedDateType',
            'completedDateType',
            'startedDateType',
        ]);
        expect(getProcessDefinitionsSpy).toHaveBeenCalledWith(mockProcessDefinitions[0].appName);
        expect(getApplicationVersionsSpy).toHaveBeenCalledWith(mockProcessDefinitions[0].appName);
        expect(searchSpy).toHaveBeenCalledWith(mockProcessFilterCloudModel.initiators[0]);
        expect(isLoading).toBe(false);
    });

    it('should check if filter is default', () => {
        const isDefaultFilterSpy = spyOn(processFilterCloudService, 'isDefaultFilter').and.returnValue(true);

        service.isDefaultFilter(mockProcessFilterCloudModel);

        expect(isDefaultFilterSpy).toHaveBeenCalledWith(mockProcessFilterCloudModel.name);
    });

    it('should save filter', async () => {
        const updateFilterSpy = spyOn(processFilterCloudService, 'updateFilter').and.returnValue(of([mockProcessFilterCloudModel]));

        await service.saveFilter(mockProcessFilterCloudModel).pipe(take(1)).toPromise();

        expect(updateFilterSpy).toHaveBeenCalledWith(mockProcessFilterCloudModel);
    });

    it('should save filter as', async () => {
        const addFilterSpy = spyOn(processFilterCloudService, 'addFilter').and.returnValue(of([mockProcessFilterCloudModel]));

        await service.saveFilterAs(mockProcessFilterCloudModel, 'mockNewFilterName').pipe(take(1)).toPromise();

        expect(addFilterSpy).toHaveBeenCalledWith(mockProcessFilterCloudModel);
    });

    it('should delete filter', async () => {
        const deleteFilterSpy = spyOn(processFilterCloudService, 'deleteFilter').and.returnValue(of([mockProcessFilterCloudModel]));

        await service.deleteFilter(mockProcessFilterCloudModel).pipe(take(1)).toPromise();

        expect(deleteFilterSpy).toHaveBeenCalledWith(mockProcessFilterCloudModel);
    });

    it('should convert filter array to process filter cloud', async () => {
        const sourceProcessFilterCloud = mockProcessFilterCloudModel;
        const filters = await service.getFilters(sourceProcessFilterCloud).pipe(take(1)).toPromise();

        const newProcessFilterCloud = service.createProcessFilterCloudModel(sourceProcessFilterCloud, filters);

        expect(newProcessFilterCloud.appVersions).toEqual(sourceProcessFilterCloud.appVersions);
        expect(newProcessFilterCloud.completedDateType).toEqual(sourceProcessFilterCloud.completedDateType);
        expect(newProcessFilterCloud.startedDateType).toEqual(sourceProcessFilterCloud.startedDateType);
        expect(newProcessFilterCloud.statuses).toEqual(sourceProcessFilterCloud.statuses);
        expect(newProcessFilterCloud.suspendedDateType).toEqual(sourceProcessFilterCloud.suspendedDateType);
        expect(newProcessFilterCloud.processDefinitionNames).toEqual(sourceProcessFilterCloud.processDefinitionNames);
        expect(newProcessFilterCloud.initiators).toEqual(sourceProcessFilterCloud.initiators);
    });
});
