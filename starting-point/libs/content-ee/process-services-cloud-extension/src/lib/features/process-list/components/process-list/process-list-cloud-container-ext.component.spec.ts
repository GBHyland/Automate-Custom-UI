/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { AppConfigService, NotificationService, NoopTranslateModule, NoopAuthModule, AdfDateFnsAdapter } from '@alfresco/adf-core';
import {
    ProcessCloudModule,
    ProcessFilterCloudService,
    ProcessListCloudService,
    ProcessCloudService,
    ProcessDefinitionCloud,
    PROCESS_FILTERS_SERVICE_TOKEN,
    LocalPreferenceCloudService,
    NotificationCloudService,
    DisplayModeService,
    FormCloudDisplayMode,
} from '@alfresco/adf-process-services-cloud';
import { ProcessFiltersCloudExtComponent } from '../process-filters/process-filters-cloud-ext.component';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { fakeProcessCloudFilter, fakeProcessCloudFilters } from '../../mock/process-filter.mock';
import { fakeProcessCloudList, fakeProcessCloudFilterProperties, fakeProcessCloudDatatableSchema } from '../../mock/process-list.mock';
import { ProcessListCloudContainerExtComponent } from './process-list-cloud-container-ext.component';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import {
    selectProcessDefinitionsLoaderIndicator,
    selectProcessesWithVariableEntities,
} from '../../../../store/selectors/process-definitions.selector';
import { selectProcessDefinitionsVariableColumnsSchema } from '../../../../store/selectors/datatable-columns-schema.selector';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Apollo } from 'apollo-angular';
import { MockProvider } from 'ng-mocks';
import { ProcessFilterService } from '../../services/process-filters/process-filter.service';
import { StringFilter } from '@alfresco-dbp/shared-filters-services';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter } from '@angular/material/core';

describe('ProcessListCloudContainerExtComponent', () => {
    let component: ProcessListCloudContainerExtComponent;
    let fixture: ComponentFixture<ProcessListCloudContainerExtComponent>;
    let processCloudFilterService: ProcessFilterCloudService;
    let processCloudListService: ProcessListCloudService;
    let processServiceCloud: ProcessCloudService;
    let getFilterByIdSpy: jasmine.Spy;
    let getProcessFiltersSpy: jasmine.Spy;
    let appConfig: AppConfigService;
    let store: MockStore<any>;
    let notificationService: NotificationService;
    let loader: HarnessLoader;
    let processFilterService: ProcessFilterService;
    const apolloMock = jasmine.createSpyObj('Apollo', ['use', 'createNamed']);

    const activatedRoute = {
        queryParams: new BehaviorSubject<any>({ filterId: '123' }),
    };
    const processDefinitions = [
        new ProcessDefinitionCloud({
            appName: 'myApp',
            appVersion: 0,
            id: 'NewProcess:1',
            name: 'process1',
            key: 'process-12345-f992-4ee6-9742-3a04617469fe',
            formKey: 'mockFormKey',
            category: 'fakeCategory',
            description: 'fakeDesc',
        }),
    ];

    const fakeStringFilter = new StringFilter({
        name: 'fakeFilter',
        translationKey: 'fakeFilter',
        value: ['fakeValue'],
        visible: true,
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                NoopAuthModule,
                ProcessCloudModule,
                MatSnackBarModule,
                MatDatepickerModule,
                MatSelectModule,
                ProcessListCloudContainerExtComponent,
                ProcessFiltersCloudExtComponent,
            ],
            providers: [
                {
                    provide: Apollo,
                    useValue: apolloMock,
                },
                { provide: PROCESS_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService },
                {
                    provide: ActivatedRoute,
                    useValue: activatedRoute,
                },
                provideMockStore({
                    initialState: {},
                    selectors: [
                        { selector: selectApplicationName, value: 'mock-appName' },
                        { selector: selectProcessDefinitionsLoaderIndicator, value: true },
                        { selector: selectProcessesWithVariableEntities, value: [] },
                        { selector: selectProcessDefinitionsVariableColumnsSchema, value: [] },
                        { selector: selectIfCurrentFilterCanBeRefreshed, value: false },
                    ],
                }),
                {
                    provide: NotificationCloudService,
                    useValue: {
                        makeGQLQuery: () => of([]),
                    },
                },
                MockProvider(ProcessFilterService, {
                    getFilters: () => of([fakeStringFilter]),
                    isDefaultFilter: () => true,
                    saveFilter: () => of([fakeProcessCloudFilter]),
                    saveFilterAs: () => of([fakeProcessCloudFilter]),
                    deleteFilter: () => of([fakeProcessCloudFilter]),
                    createProcessFilterCloudModel: () => fakeProcessCloudFilter,
                }),
                { provide: DateAdapter, useClass: AdfDateFnsAdapter },
            ],
        });

        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeProcessCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeProcessCloudFilterProperties);
        appConfig.config = Object.assign(appConfig.config, { notifications: true });
        processServiceCloud = TestBed.inject(ProcessCloudService);
        processCloudFilterService = TestBed.inject(ProcessFilterCloudService);
        processCloudListService = TestBed.inject(ProcessListCloudService);
        store = TestBed.inject(MockStore);
        notificationService = TestBed.inject(NotificationService);
        processFilterService = TestBed.inject(ProcessFilterService);

        spyOn(processServiceCloud, 'getProcessDefinitions').and.returnValue(of(processDefinitions));
        getFilterByIdSpy = spyOn(processCloudFilterService, 'getFilterById').and.returnValue(of(fakeProcessCloudFilter));
        getProcessFiltersSpy = spyOn(processCloudFilterService, 'getProcessFilters').and.returnValue(of(fakeProcessCloudFilters));
        spyOn(processCloudListService, 'fetchProcessList').and.returnValue(of(fakeProcessCloudList));

        fixture = TestBed.createComponent(ProcessListCloudContainerExtComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('When filterId is absent from the route queryParams', () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({});
            fixture.detectChanges();
        });

        it('Should get the first available filter', () => {
            expect(getProcessFiltersSpy).toHaveBeenCalledWith('mock-appName');
            expect(component.processFilter.id).toEqual(fakeProcessCloudFilters[0].id);
        });
    });

    describe('When filterId is present in the route queryParams', () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({ filterId: '123' });
            fixture.detectChanges();
        });

        it('Should get params from routing', () => {
            expect(getFilterByIdSpy).toHaveBeenCalledWith('mock-appName', '123');
            expect(component.processFilter.id).toEqual(fakeProcessCloudFilter.id);
        });
    });

    describe(`When filters loaded`, () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({});
            fixture.detectChanges();
        });

        it('should get filters', () => {
            expect(component.filters).toEqual([fakeStringFilter]);
        });

        it('should render hxp-filters-container', () => {
            const filtersContainer = fixture.debugElement.query(By.css('hxp-filters-container'));
            expect(filtersContainer).toBeDefined();
        });

        it('should update the process list pagination on filters change', () => {
            const paginationSpy = spyOn(component.processListExtCloudComponent, 'fetchCloudPaginationPreference');

            component.onFiltersChange([]);
            fixture.detectChanges();

            expect(paginationSpy).toHaveBeenCalled();
        });

        it('should save filter, show notification and navigate to filter on filter save', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const saveFilterSpy = spyOn(processFilterService, 'saveFilter').and.returnValue(of([fakeProcessCloudFilter]));

            component.onFilterSave();

            expect(saveFilterSpy).toHaveBeenCalledWith(component.processFilter);
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: component.processFilter.id,
                })
            );
        });

        it('should add filter, show notification and navigate to filter on filter save as', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const saveFilterAsSpy = spyOn(processFilterService, 'saveFilterAs').and.returnValue(of([fakeProcessCloudFilter]));

            component.onFilterSaveAs('mock-name');

            expect(saveFilterAsSpy).toHaveBeenCalledWith(component.processFilter, 'mock-name');
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: component.processFilter.id,
                })
            );
        });

        it('should delete filter, show notification and navigate to first filter on filter delete', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const deleteFilterSpy = spyOn(processFilterService, 'deleteFilter').and.returnValue(of([fakeProcessCloudFilter]));

            component.onFilterDelete();

            expect(deleteFilterSpy).toHaveBeenCalledWith(component.processFilter);
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_DELETED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: fakeProcessCloudFilter.id,
                })
            );
        });
    });

    describe('Router Query params', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('Should able to call getFilterById to get filter details on router params change', () => {
            spyOn(store, 'dispatch');
            activatedRoute.queryParams.next({ filterId: 'new-filter-id' });
            fixture.detectChanges();

            expect(getFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'new-filter-id');
        });

        it('Should restore the chrome bar status when navigated to', () => {
            const displaySpy = spyOn(DisplayModeService, 'changeDisplayMode');
            spyOn(store, 'dispatch');
            activatedRoute.queryParams.next({ filterId: 'new-filter-id' });
            fixture.detectChanges();

            expect(displaySpy).toHaveBeenCalledWith({ displayMode: FormCloudDisplayMode.inline });
        });

        it('Should able to dispatch setProcessManagementFilter action on router params change', () => {
            spyOn(store, 'dispatch');
            activatedRoute.queryParams.next({ filterId: 'new-filter-id' });
            fixture.detectChanges();

            expect(store.dispatch).toHaveBeenCalledWith(
                setProcessManagementFilter({
                    payload: {
                        type: FilterType.PROCESS,
                        filter: fakeProcessCloudFilter,
                    },
                })
            );
        });
    });

    describe('Refresh List button', () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({ filterId: '123' });
            fixture.detectChanges();
        });

        it('should allow the user to refresh the list anytime', async () => {
            spyOn(store, 'dispatch').and.callThrough();
            const actionTaskOrProcessFilterUpdate = taskOrProcessFilterUpdate({ filterKey: component.processFilter.key, canBeRefreshed: false });
            const refreshFilterSpy = spyOn(processCloudFilterService, 'refreshFilter');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            component.showRefreshButton = true;
            fixture.detectChanges();
            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.processListExtCloudComponent, 'reload');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, false);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).not.toHaveBeenCalled();

            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, true);
            store.refreshState();
            fixture.detectChanges();
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(actionTaskOrProcessFilterUpdate);
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
            expect(refreshFilterSpy).toHaveBeenCalled();
        });

        it('should display a message saying the list is up to date if there are no changes', async () => {
            spyOn(store, 'dispatch').and.callThrough();
            component.showRefreshButton = true;
            fixture.detectChanges();
            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.processListExtCloudComponent, 'reload');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, false);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).not.toHaveBeenCalled();
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        });

        it('should notify the user that the list is refreshed when there is a notification and synchronization is needed', async () => {
            spyOn(store, 'dispatch').and.callThrough();
            component.showRefreshButton = true;
            fixture.detectChanges();
            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.processListExtCloudComponent, 'reload');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, true);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).toHaveBeenCalled();
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        });
    });

    describe('Column order', () => {
        it('should display datatable columns in the correct order as specified by the schema', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            const expectedNameHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.NAME';
            const expectedProcessDefinitionNameHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.PROCESS_DEFINITION_NAME';
            const expectedRelatedProcessHeaderText = 'PROCESS_CLOUD_EXTENSION.PROCESS_LIST.PROPERTIES.RELATED_PROCESS';
            const expectedStatusHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.STATUS';
            const expectedStartDateHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.START_DATE';
            const expectedCompletedDateHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.COMPLETED_DATE';
            const expectedStartedByHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.INITIATOR';
            const expectedAppVersionHeaderText = 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.APP_VERSION';
            const expectedActionsHeaderText = 'view_week_outlineADF-DATATABLE.ACCESSIBILITY.ACTIONS';

            const tableHeaderList: HTMLElement[] = fixture.nativeElement.querySelectorAll('.adf-datatable-cell-header');

            expect(tableHeaderList[0].textContent.trim()).toEqual(expectedNameHeaderText);
            expect(tableHeaderList[1].textContent.trim()).toEqual(expectedProcessDefinitionNameHeaderText);
            expect(tableHeaderList[2].textContent.trim()).toEqual(expectedRelatedProcessHeaderText);
            expect(tableHeaderList[3].textContent.trim()).toEqual(expectedStatusHeaderText);
            expect(tableHeaderList[4].textContent.trim()).toEqual(expectedStartDateHeaderText);
            expect(tableHeaderList[5].textContent.trim()).toEqual(expectedCompletedDateHeaderText);
            expect(tableHeaderList[6].textContent.trim()).toEqual(expectedStartedByHeaderText);
            expect(tableHeaderList[7].textContent.trim()).toEqual(expectedAppVersionHeaderText);
            expect(tableHeaderList[8].textContent.trim()).toEqual(expectedActionsHeaderText);
        });
    });
});
