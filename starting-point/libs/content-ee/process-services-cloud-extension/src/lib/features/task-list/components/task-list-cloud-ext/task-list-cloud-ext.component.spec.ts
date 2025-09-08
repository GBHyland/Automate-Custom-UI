/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import {
    completedTasksMockList,
    fakeTaskCloudDatatableSchema,
    fakeTaskCloudList,
    mockTaskListPresetColumns,
    myTasksMockList,
    queuedTasksMockList,
} from '../../mock/task-list.mock';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { navigateToTaskDetails } from '../../store/actions/task-list-cloud.actions';
import {
    completedTasksQueryRequestMock,
    fakeEditTaskFilter,
    fakeTaskCloudFilters,
    fakeTaskFilter,
    myTasksQueryRequestMock,
    queuedTasksQueryRequestMock,
} from '../../mock/task-filter.mock';
import { Component, Input, OnInit } from '@angular/core';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import { ExtensionService } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import {
    TaskCloudModule,
    TaskDetailsCloudModel,
    TASK_LIST_CLOUD_TOKEN,
    TaskListCloudComponent,
    TaskListCloudService,
    TASK_LIST_PREFERENCES_SERVICE_TOKEN,
} from '@alfresco/adf-process-services-cloud';
import { TaskListCloudServiceInterface } from '@alfresco/adf-process-services-cloud/lib/services/task-list-cloud.service.interface';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialProcessServicesCloudState } from '../../../../store/states/state';
import { featureKey } from '../../../../store/reducers/reducer';
import { Router } from '@angular/router';
import { IconHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskListCloudExtComponent', () => {
    let component: TaskListCloudExtComponent;
    let fixture: ComponentFixture<TaskListCloudExtComponent>;
    let taskCloudListService: TaskListCloudServiceInterface;
    let store: MockStore<any>;
    let router: Router;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;

    let appConfig: AppConfigService;
    let fetchTaskListSpy: jasmine.Spy;

    const preferencesService = jasmine.createSpyObj('preferencesService', {
        getPreferences: of({}),
        updatePreference: of({}),
    });

    beforeEach(() => {
        const processDefinitionCloudState = initialProcessServicesCloudState;
        processDefinitionCloudState.processDefinitions.loaded = true;
        const initialState = {
            [featureKey]: processDefinitionCloudState,
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAuthModule, TaskCloudModule, NoopAnimationsModule, TaskListCloudExtComponent],
            providers: [
                provideMockStore({ initialState }),
                { provide: TASK_LIST_CLOUD_TOKEN, useClass: TaskListCloudService },
                {
                    provide: TASK_LIST_PREFERENCES_SERVICE_TOKEN,
                    useValue: preferencesService,
                },
            ],
        });

        fixture = TestBed.createComponent(TaskListCloudExtComponent);
        component = fixture.componentInstance;
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditTaskFilter);
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);
        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'isColumnResizingEnabled').and.returnValue(true);

        store = TestBed.inject(MockStore);
        fetchTaskListSpy = spyOn(taskCloudListService, 'fetchTaskList').and.returnValue(of(fakeTaskCloudList));
        component.currentFilter = fakeTaskFilter;

        router = TestBed.inject(Router);
        spyOn(router, 'navigateByUrl').and.stub();

        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('should set isResizingEnabled property', () => {
        expect(component.isResizingEnabled).toBeTrue();
    });

    it('Should load task list', () => {
        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-cloud-task-list');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');
        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();
        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_nameFake1"]`));

        expect(value1).not.toBeNull();
        expect(value1.nativeElement.textContent.trim()).toBe('nameFake1');
    });

    // TODO: https://hyland.atlassian.net/browse/AAE-30630
    // eslint-disable-next-line ban/ban
    xit('should display the default columns', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfTaskList = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-cell-header .adf-datatable-cell-value');
        const textContents: string[] = [...adfTaskList].map((element: any) => element.textContent.trim());

        expect(textContents).toEqual([
            'ADF_CLOUD_TASK_LIST.PROPERTIES.NAME',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE',
            'ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY',
        ]);
    });

    it('should enable column selector feature', () => {
        const taskListCloudComponent = fixture.debugElement.query(By.css('adf-cloud-task-list'));
        const taskListCloudComponentInstance = taskListCloudComponent.componentInstance as TaskListCloudComponent;
        expect(taskListCloudComponentInstance.showMainDatatableActions).toBe(true);
    });

    it('Should be able to dispatch navigateToTaskDetails action on row single click', () => {
        const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
        component.navigateToTaskDetails('999');
        fixture.detectChanges();
        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '999' }));
    });

    it('Should be able to dispatch navigateToTaskDetails action and reload component', () => {
        const taskListCloudComponentSpy = spyOn(component.taskListCloudComponent, 'reload');
        fixture.detectChanges();
        component.reload();
        expect(taskListCloudComponentSpy).toHaveBeenCalled();
    });

    describe('Context Action Menu', () => {
        beforeEach(() => {
            fixture.detectChanges();
            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_nameFake1"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        });

        it('Should be able to display view details context action text on right click of task', () => {
            const viewContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`
            );
            expect(viewContextAction.textContent).toContain('PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        it('Should be able to display view details context action icon on right click of task', async () => {
            const viewDetailsIconName = await IconHarnessUtils.getIconName({
                fixture,
                iconFilters: { ancestor: '.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]' },
                fromRoot: true,
            });
            expect(viewDetailsIconName).toBe('open_in_new');
        });

        it('Should be able to display process history context action text on right click of task', () => {
            const processHistoryContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY"]`
            );
            expect(processHistoryContextAction.textContent).toContain('PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY');
        });

        it('Should be able to display process history context action icon on right click of task', async () => {
            const processHistoryIconName = await IconHarnessUtils.getIconName({
                fixture,
                iconFilters: {
                    ancestor: '.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY"]',
                },
                fromRoot: true,
            });
            expect(processHistoryIconName).toBe('history');
        });

        it('Should be able to dispatch navigateToTaskDetails action on view action click', () => {
            const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
            const viewContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`
            );
            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();
            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(
                navigateToTaskDetails({
                    taskId: 'mockId',
                })
            );
        });

        it('Should be able to call navigateToProcessHistory with right param on process history action click', () => {
            const navigateToProcessHistorySpy = spyOn(component, 'navigateToProcessHistory');
            const processHistoryContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY"]`
            );

            processHistoryContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(processHistoryContextAction.textContent).toContain('PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY');
            expect(navigateToProcessHistorySpy).toHaveBeenCalledWith('mockProcessInstanceId');
        });

        it('Should navigate to process instance history on process history action click', () => {
            const processHistoryContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY"]`
            );
            processHistoryContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(router.navigateByUrl).toHaveBeenCalledWith('/process-details-cloud?processInstanceId=mockProcessInstanceId');
        });
    });

    describe('Display Tasks based the filter params', () => {
        const myTasksFilter = fakeTaskCloudFilters[0];
        const queuedTasksFilter = fakeTaskCloudFilters[1];
        const completedTasksFilter = fakeTaskCloudFilters[2];

        function getTasksRowsByStatus(status: string) {
            return fixture.debugElement.queryAll(By.css(`[data-automation-id="text_${status}"]`));
        }

        it('Should be able to fetch only assigned tasks when currentFilter set to my tasks filter', () => {
            fetchTaskListSpy.calls.reset();
            fetchTaskListSpy.and.returnValue(of(myTasksMockList));
            component.currentFilter = myTasksFilter;
            fixture.detectChanges();

            const myTasks = getTasksRowsByStatus('ASSIGNED');

            expect(fetchTaskListSpy).toHaveBeenCalledWith(myTasksQueryRequestMock);
            expect(myTasks.length).toBe(2);
            expect(myTasks[0].nativeElement.textContent.trim()).toBe('ASSIGNED');
            expect(myTasks[1].nativeElement.textContent.trim()).toBe('ASSIGNED');
        });

        it('Should be able to fetch only queued tasks when currentFilter set to queued tasks filter', () => {
            fetchTaskListSpy.calls.reset();
            fetchTaskListSpy.and.returnValue(of(queuedTasksMockList));
            component.currentFilter = queuedTasksFilter;
            fixture.detectChanges();

            const queuedTasks = getTasksRowsByStatus('CREATED');

            expect(fetchTaskListSpy).toHaveBeenCalledWith(queuedTasksQueryRequestMock);
            expect(queuedTasks.length).toBe(2);
            expect(queuedTasks[0].nativeElement.textContent.trim()).toBe('CREATED');
            expect(queuedTasks[1].nativeElement.textContent.trim()).toBe('CREATED');
        });

        it('Should be able to fetch completed tasks when currentFilter set to completed tasks filter', () => {
            fetchTaskListSpy.calls.reset();
            fetchTaskListSpy.and.returnValue(of(completedTasksMockList));
            component.currentFilter = completedTasksFilter;
            fixture.detectChanges();

            const completedTasks = getTasksRowsByStatus('COMPLETED');

            expect(completedTasks.length).toBe(2);
            expect(fetchTaskListSpy).toHaveBeenCalledWith(completedTasksQueryRequestMock);
            expect(completedTasks[0].nativeElement.textContent.trim()).toBe('COMPLETED');
            expect(completedTasks[1].nativeElement.textContent.trim()).toBe('COMPLETED');
        });
    });
});

@Component({
    standalone: true,
    selector: 'apa-custom-task-name-column',
    template: `
        <span data-automation-id="task-name-custom-column">{{ displayValue.name }}</span
        ><br />
        <div>
            <span>Assignee By : </span>
            <span data-automation-id="task-assignee-custom-column">{{ displayValue.assignee }}</span>
        </div>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskNameComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}
@Component({
    standalone: true,
    selector: 'apa-custom-task-status-column',
    template: `
        <i data-automation-id="task-status-icon-custom-column" class="far fa-check-circle"></i>
        <span data-automation-id="task-status-custom-column">{{ displayValue.status }}</span>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskStatusComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

describe('TaskListCloudExtComponent with Custom Columns', () => {
    let component: TaskListCloudExtComponent;
    let fixture: ComponentFixture<TaskListCloudExtComponent>;
    let taskCloudListService: TaskListCloudServiceInterface;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;

    const processDefinitionCloudState = initialProcessServicesCloudState;
    processDefinitionCloudState.processDefinitions.loaded = true;
    const initialState = {
        [featureKey]: processDefinitionCloudState,
    };
    const preferencesService = jasmine.createSpyObj('preferencesService', {
        getPreferences: of({}),
        updatePreference: of({}),
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                TaskCloudModule,
                NoopTranslateModule,
                NoopAuthModule,
                TaskListCloudExtComponent,
                MockCustomTaskStatusComponent,
                MockCustomTaskNameComponent,
            ],
            providers: [
                provideMockStore({ initialState }),
                { provide: TASK_LIST_CLOUD_TOKEN, useClass: TaskListCloudService },
                {
                    provide: TASK_LIST_PREFERENCES_SERVICE_TOKEN,
                    useValue: preferencesService,
                },
            ],
        });

        fixture = TestBed.createComponent(TaskListCloudExtComponent);
        component = fixture.componentInstance;
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);

        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getTasksColumns').and.returnValue(of(mockTaskListPresetColumns));
        spyOn(taskCloudListService, 'fetchTaskList').and.returnValue(of(fakeTaskCloudList));

        TestBed.inject(ExtensionService).setComponents({
            'app.taskList.columns.name': MockCustomTaskNameComponent,
            'app.taskList.columns.status': MockCustomTaskStatusComponent,
        });

        component.currentFilter = fakeTaskFilter;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('Should fetch task list and display custom columns preset from extension', () => {
        const adfTaskList = fixture.debugElement.nativeElement.querySelectorAll('.adf-datatable-cell-header .adf-datatable-cell-value');
        expect(adfTaskList).not.toBeNull();
        expect(adfTaskList[0].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.NAME');
        expect(adfTaskList[1].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS');
        expect(adfTaskList[2].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE');
        expect(adfTaskList[3].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE');
        expect(adfTaskList[4].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED');
        expect(adfTaskList[5].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE');
        expect(adfTaskList[6].textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY');
    });

    it('Should task list display custom template extension columns', () => {
        const customTaskNameTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-name-column'));
        const customTaskNameColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-name-custom-column"]`));
        const customTaskAssigneeElement = fixture.debugElement.query(By.css(`[data-automation-id="task-assignee-custom-column"]`));

        expect(customTaskNameTemplateSelector).not.toBeNull();
        expect(customTaskNameColumn).not.toBeNull();
        expect(customTaskAssigneeElement).not.toBeNull();

        expect(customTaskNameColumn.nativeElement.textContent.trim()).toBe('nameFake1');
        expect(customTaskAssigneeElement.nativeElement.textContent.trim()).toBe('mock-assignee');

        const customTaskStatusTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-status-column'));
        const customTaskStatusColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-status-custom-column"]`));
        const customTaskStatusIconElement = fixture.debugElement.query(By.css(`[data-automation-id="task-status-icon-custom-column"]`));

        expect(customTaskStatusTemplateSelector).not.toBeNull();
        expect(customTaskStatusColumn).not.toBeNull();
        expect(customTaskStatusIconElement).not.toBeNull();

        expect(customTaskStatusColumn.nativeElement.textContent.trim()).toBe('ASSIGNED');
    });
});
