/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormModel, FormOutcomeEvent, FormOutcomeModel, NoopAuthModule, NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    TaskCloudModule,
    TaskCloudService,
    TaskDetailsCloudModel,
    TaskFilterCloudService,
    TaskListCloudService,
    UserTaskCloudComponent,
} from '@alfresco/adf-process-services-cloud';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { TaskDetailsCloudExtComponent } from './task-details-cloud-ext.component';
import {
    assignedTaskDetailsCloudMock,
    cancelledTaskDetailsCloudMock,
    completedTaskDetailsCloudMock,
    createdTaskDetailsCloudMock,
    fakeTaskDetails,
    suspendedTaskDetailsCloudMock,
} from '../../mock/task-details.mock';
import { navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { By } from '@angular/platform-browser';
import { openTaskAssignmentDialog, taskCompletedRedirection } from '../../../../store/actions/task-details.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { STORE_ACTIONS_PROVIDER } from '../../../../services/process-services-cloud-extension-actions.provider';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { navigateToTaskDetails } from '../../../task-list/store/actions/task-list-cloud.actions';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

describe('TaskDetailsCloudExtComponent', () => {
    let component: TaskDetailsCloudExtComponent;
    let fixture: ComponentFixture<TaskDetailsCloudExtComponent>;
    let store: MockStore<any>;
    let taskCloudService: TaskCloudService;
    let getTaskByIdSpy: jasmine.Spy;
    let getCandidateUsersSpy: jasmine.Spy;
    let getCandidateGroupsSpy: jasmine.Spy;
    let notificationService: NotificationService;
    let taskListCloudService: TaskListCloudService;
    let router: Router;
    const mockRouterParams = new Subject();
    const mockActionType = { type: 'MOCK_SET_FILE_UPLOADING_DIALOG' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                NoopAuthModule,
                EffectsModule.forRoot([]),
                StoreModule.forRoot({}),
                TaskCloudModule,
                MatSnackBarModule,
                TaskDetailsCloudExtComponent,
            ],
            providers: [
                {
                    provide: TaskFilterCloudService,
                    useValue: {
                        getTaskFilterById: () => of([]),
                        getTaskListFilters: () =>
                            of([
                                {
                                    key: TaskDetailsCloudExtComponent.COMPLETED_TASK,
                                    id: 'completed-task-filter-id',
                                },
                            ]),
                    },
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: mockRouterParams,
                    },
                },
                {
                    provide: STORE_ACTIONS_PROVIDER,
                    useValue: {
                        getOnInitAction() {
                            return mockActionType;
                        },
                        getOnDestroyAction() {
                            return mockActionType;
                        },
                    },
                },
                provideMockStore({
                    initialState: {},
                    selectors: [
                        {
                            selector: selectApplicationName,
                            value: 'mock-appName',
                        },
                        {
                            selector: selectProcessManagementFilter,
                            value: { id: 'mockId', name: 'mockFilter' },
                        },
                    ],
                }),
                provideMockFeatureFlags({
                    'cic-workspace-satori-application-chrome': false,
                }),
            ],
        });

        fixture = TestBed.createComponent(TaskDetailsCloudExtComponent);
        component = fixture.componentInstance;
        taskCloudService = TestBed.inject(TaskCloudService);
        notificationService = TestBed.inject(NotificationService);
        router = TestBed.inject(Router);
        store = TestBed.inject(MockStore);
        taskListCloudService = TestBed.inject(TaskListCloudService);

        getTaskByIdSpy = spyOn(taskCloudService, 'getTaskById').and.returnValue(of(fakeTaskDetails));
        getCandidateUsersSpy = spyOn(taskCloudService, 'getCandidateUsers').and.returnValue(of([]));
        getCandidateGroupsSpy = spyOn(taskCloudService, 'getCandidateGroups').and.returnValue(of([]));

        fixture.detectChanges();
        mockRouterParams.next({ taskId: '123' });
        component.onTaskDetailsLoaded(fakeTaskDetails);
        fixture.detectChanges();
    });

    it('should get the task by id', () => {
        expect(getTaskByIdSpy).toHaveBeenCalledOnceWith('mock-appName', '123');
    });

    it('should load task empty form', () => {
        const adfCloudForm = fixture.debugElement.nativeElement.querySelector('adf-cloud-form');
        const adfCloudFormTitle = fixture.debugElement.nativeElement.querySelector('adf-empty-content__title');

        expect(adfCloudForm).toBeDefined();
        expect(adfCloudFormTitle).toBeDefined();
    });

    it('should display task filter breadcrumb when navigating from task list', () => {
        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(4);
        expect(breadcrumb[2].textContent).toBe('mockFilter');
        expect(breadcrumb[3].textContent).toBe('task1');
    });

    it('should display process name breadcrumb when navigating from process details', () => {
        mockRouterParams.next({
            taskId: '123',
            processName: 'mock-process-name',
        });
        fixture.detectChanges();

        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(5);
        expect(breadcrumb[3].textContent).toBe('mock-process-name');
    });

    it('should display task details sidebar', () => {
        component.showMetadata = true;
        fixture.detectChanges();

        const adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header'
        );

        expect(adfTaskDetailsCardView).not.toBeNull();
    });

    it('should display task details info icon', () => {
        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');

        expect(adfTaskDetailsInfoIcon).toBeDefined();
    });

    it('should show/hide task details sidebar when clicking info icon', () => {
        let adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-card-view'
        );

        expect(component.showMetadata).toEqual(false);
        expect(adfTaskDetailsCardView).toBeNull();

        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');
        adfTaskDetailsInfoIcon.click();

        fixture.detectChanges();

        adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header'
        );

        expect(adfTaskDetailsCardView).not.toBeNull();
        expect(component.showMetadata).toEqual(true);
    });

    it('should redirect to task list when clicking cancel task button', () => {
        const routerSpy = spyOn(router, 'navigateByUrl');

        fixture.detectChanges();

        const userTaskCloudDebugEl = fixture.debugElement.query(By.directive(UserTaskCloudComponent));
        const userTaskCloudInstance = userTaskCloudDebugEl.componentInstance as UserTaskCloudComponent;
        userTaskCloudInstance.cancelClick.emit();

        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith('/task-list-cloud?filterId=mockId');
    });

    it('should redirect to task list when clicking close button', async () => {
        const routerSpy = spyOn(router, 'navigateByUrl');

        const adfTaskDetailsCancelButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-close-drawer-icon"]');
        adfTaskDetailsCancelButton.click();

        fixture.detectChanges();
        expect(routerSpy).toHaveBeenCalledWith('/task-list-cloud?filterId=mockId');
    });

    it('should navigate to the specific filter when clicking the breadcrumb', () => {
        spyOn(store, 'dispatch');

        fixture.detectChanges();

        const taskFilterBreadcrumb = fixture.debugElement.nativeElement.querySelector('.apa-task-filter-item');
        taskFilterBreadcrumb.dispatchEvent(new MouseEvent('click'));

        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(
            navigateToFilter({
                filterId: 'mockId',
            })
        );
    });

    it('should dispatch navigation redirection when completing the task and next task checkbox is not checked', () => {
        spyOn(store, 'dispatch');
        component.isNextTaskCheckboxChecked = false;
        component.taskId = '123';

        component.onCompleteTaskForm();

        expect(store.dispatch).toHaveBeenCalledWith(taskCompletedRedirection({ taskId: '123' }));
    });

    it('should show a notification and open the next task if the checkbox is checked', () => {
        const openNextTaskSpy = spyOn<any>(component, 'openNextTask');
        const showInfoSpy = spyOn(notificationService, 'showInfo');

        component.isNextTaskCheckboxChecked = true;
        component.onCompleteTaskForm();

        expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED');
        expect(openNextTaskSpy).toHaveBeenCalled();
    });

    it('should show a notification and dispatch taskCompletedRedirection if the checkbox is not checked', () => {
        spyOn(store, 'dispatch');
        const showInfoSpy = spyOn(notificationService, 'showInfo');

        component.isNextTaskCheckboxChecked = false;
        component.taskId = '123';
        component.onCompleteTaskForm();

        expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED');
        expect(store.dispatch).toHaveBeenCalledWith(taskCompletedRedirection({ taskId: '123' }));
    });

    it('should open full screen mode when clicking full screen button', () => {
        const switchToDisplayModeSpy = spyOn(component.adfUserTaskCloud, 'switchToDisplayMode');
        fixture.detectChanges();

        const adfTaskDetailsFullScreenButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-full-screen-icon"]');
        adfTaskDetailsFullScreenButton.click();

        expect(switchToDisplayModeSpy).toHaveBeenCalledWith('fullScreen');
    });

    describe('Change assignee', () => {
        const openTaskAssignmentAction = (taskId: string, appName: string, assignee: string) =>
            openTaskAssignmentDialog({
                taskId: taskId,
                appName: appName,
                assignee: assignee,
            });

        it('should not open task assignment dialog on click of assignee prop if task is in SUSPENDED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(suspendedTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CANCELLED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(cancelledTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in COMPLETED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(completedTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CREATED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(createdTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should open task assignment dialog if task is in ASSIGNED state', async () => {
            component.showMetadata = true;
            getTaskByIdSpy.and.returnValue(of(assignedTaskDetailsCloudMock));

            getCandidateUsersSpy.and.returnValue(of(['user-1', 'user-2']));
            getCandidateGroupsSpy.and.returnValue(of(['mock-group-1', 'mock-group-2']));
            spyOn(store, 'dispatch');

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-toggle-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).toHaveBeenCalledWith(
                openTaskAssignmentAction(assignedTaskDetailsCloudMock.id, assignedTaskDetailsCloudMock.appName, assignedTaskDetailsCloudMock.assignee)
            );
        });

        it('should dispatch an action when the component gets initialized', () => {
            const actionDispatchSpy = spyOn(store, 'dispatch');
            component.ngOnInit();

            expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
        });

        it('should dispatch an action when the component gets destroyed', () => {
            const actionDispatchSpy = spyOn(store, 'dispatch');

            component.ngOnInit();
            fixture.destroy();

            expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
        });

        it('should navigate on click of file content', () => {
            const taskId = '123';
            const mockNodeId = 'mock-node-id';
            const routerSpy = spyOn(router, 'navigate');
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(routerSpy).toHaveBeenCalledWith([
                `task-details-cloud/${taskId}`,
                {
                    outlets: {
                        viewer: ['preview', mockNodeId],
                    },
                },
            ]);
        });

        it('should include processName in the route url if the processName defined', () => {
            const taskId = '123';
            const processName = 'mock-process-name';
            const mockNodeId = 'mock-node-id';
            const routerSpy = spyOn(router, 'navigate');
            component.processName = processName;
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(routerSpy).toHaveBeenCalledWith([
                `task-details-cloud/${taskId}/${processName}`,
                {
                    outlets: {
                        viewer: ['preview', mockNodeId],
                    },
                },
            ]);
        });
    });

    describe('adf-cloud-user-task inputs and outputs', () => {
        let userTaskComponent: UserTaskCloudComponent;

        beforeEach(() => {
            const userTaskDebugEl = fixture.debugElement.query(By.directive(UserTaskCloudComponent));
            userTaskComponent = userTaskDebugEl.componentInstance;
        });

        describe('Button visibility inputs', () => {
            it('should bind showCancelButton input to showCancelButton$ observable', () => {
                const formModel = new FormModel({ processVariables: [{ name: 'cancelEnabled', value: 'false' }] });

                userTaskComponent.formLoaded.emit(formModel);
                fixture.detectChanges();

                expect(userTaskComponent.showCancelButton).toBe(false);
            });

            it('should default showCancelButton to true when no process variable is set', () => {
                userTaskComponent.formLoaded.emit(new FormModel());
                fixture.detectChanges();

                expect(userTaskComponent.showCancelButton).toBe(true);
            });

            it('should bind showSaveButton input to showSaveButton$ observable', () => {
                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [{ name: 'saveEnabled', value: 'false' }],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.showSaveButton).toBe(false);
            });

            it('should default showSaveButton to true when no process variable is set', () => {
                userTaskComponent.formLoaded.emit(new FormModel());
                fixture.detectChanges();

                expect(userTaskComponent.showSaveButton).toBe(true);
            });

            it('should handle string "true" and "false" values for boolean process variables', () => {
                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [
                            { name: 'cancelEnabled', value: 'true' },
                            { name: 'saveEnabled', value: 'false' },
                        ],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.showCancelButton).toBe(true);
                expect(userTaskComponent.showSaveButton).toBe(false);
            });
        });

        describe('Custom button text inputs', () => {
            it('should bind customCancelButtonText input to customCancelButtonText$ observable', () => {
                const customText = 'Custom Cancel';
                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [{ name: 'cancelLabel', value: customText }],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.customCancelButtonText).toBe(customText);
            });

            it('should default customCancelButtonText to empty string when no process variable is set', () => {
                userTaskComponent.formLoaded.emit(new FormModel());
                fixture.detectChanges();

                expect(userTaskComponent.customCancelButtonText).toBe('');
            });

            it('should bind customSaveButtonText input to customSaveButtonText$ observable', () => {
                const customText = 'Custom Save';
                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [{ name: 'saveLabel', value: customText }],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.customSaveButtonText).toBe(customText);
            });

            it('should default customSaveButtonText to empty string when no process variable is set', () => {
                userTaskComponent.formLoaded.emit(new FormModel());
                fixture.detectChanges();

                expect(userTaskComponent.customSaveButtonText).toBe('');
            });

            it('should bind customCompleteButtonText input to customCompleteButtonText$ observable', () => {
                const customText = 'Custom Complete';
                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [{ name: 'completeLabel', value: customText }],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.customCompleteButtonText).toBe(customText);
            });

            it('should default customCompleteButtonText to empty string when no process variable is set', () => {
                userTaskComponent.formLoaded.emit(new FormModel());
                fixture.detectChanges();

                expect(userTaskComponent.customCompleteButtonText).toBe('');
            });

            it('should handle multiple custom button texts simultaneously', () => {
                const cancelText = 'Custom Cancel';
                const saveText = 'Custom Save';
                const completeText = 'Custom Complete';

                userTaskComponent.formLoaded.emit(
                    new FormModel({
                        processVariables: [
                            { name: 'cancelLabel', value: cancelText },
                            { name: 'saveLabel', value: saveText },
                            { name: 'completeLabel', value: completeText },
                        ],
                    })
                );
                fixture.detectChanges();

                expect(userTaskComponent.customCancelButtonText).toBe(cancelText);
                expect(userTaskComponent.customSaveButtonText).toBe(saveText);
                expect(userTaskComponent.customCompleteButtonText).toBe(completeText);
            });
        });

        describe('Process variable value extraction', () => {
            it('should handle undefined process variable values with fallback', (done) => {
                const mockFormModel = new FormModel({
                    processVariables: [{ name: 'otherVar', value: 'otherValue' }],
                });

                component['getProcessVariableValue$']('nonExistentVar', 'fallbackValue').subscribe((value) => {
                    expect(value).toBe('fallbackValue');
                    done();
                });

                userTaskComponent.formLoaded.emit(mockFormModel);
            });

            it('should handle null process variable values with fallback', (done) => {
                const mockFormModel = new FormModel();
                spyOn(mockFormModel, 'getProcessVariableValue').and.returnValue(null);

                component['getProcessVariableValue$']('testVar', 'fallbackValue').subscribe((value) => {
                    expect(value).toBe('fallbackValue');
                    done();
                });

                userTaskComponent.formLoaded.emit(mockFormModel);
            });

            it('should convert string boolean values correctly', (done) => {
                const mockFormModel = new FormModel();
                spyOn(mockFormModel, 'getProcessVariableValue').and.returnValue('true');

                component['getProcessVariableValue$']('testVar', false).subscribe((value) => {
                    expect(value).toBe(true);
                    done();
                });

                userTaskComponent.formLoaded.emit(mockFormModel);
            });

            it('should handle non-boolean string values for boolean fallback', (done) => {
                const mockFormModel = new FormModel();
                spyOn(mockFormModel, 'getProcessVariableValue').and.returnValue('notABoolean');

                component['getProcessVariableValue$']('testVar', false).subscribe((value) => {
                    expect(value).toBe(false);
                    done();
                });

                userTaskComponent.formLoaded.emit(mockFormModel);
            });

            it('should emit distinct values only when same model is emitted multiple times', () => {
                const mockFormModel = new FormModel({
                    processVariables: [{ name: 'testVar', value: 'sameValue' }],
                });

                let emitCount = 0;
                component['getProcessVariableValue$']('testVar', 'fallback').subscribe(() => {
                    emitCount++;
                });

                userTaskComponent.formLoaded.emit(mockFormModel);
                userTaskComponent.formLoaded.emit(mockFormModel);
                userTaskComponent.formLoaded.emit(mockFormModel);

                expect(emitCount).toBe(1);
            });
        });
    });

    describe('error handling', () => {
        const message = 'Failed to complete the task';

        it('should show error message on api fail when error is a string', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(message);
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is an object', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(JSON.stringify({ message }));
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is a nested object', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(JSON.stringify({ entry: { message } }));
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is a duplicate correlation key', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    status: 409,
                    message: 'Duplicate message subscription test with correlation key test',
                })
            );
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.DUPLICATE_CORRELATION_KEY');
        });

        it('should show error message on api fail when error is unauthorized access', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    entry: {
                        code: 403,
                        message: 'Operation not permitted for task-uuid',
                    },
                })
            );

            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.UNAUTHORIZED');
        });

        it('should show all the error messages as comma separated when there are list of errors', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    errors: [
                        {
                            message: 'Textfield-1 is a required field and has to have some value',
                        },
                        {
                            message: 'Dropdown-123 is a required field and has to have some value',
                        },
                    ],
                })
            );
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(
                'Textfield-1 is a required field and has to have some value, Dropdown-123 is a required field and has to have some value'
            );
        });

        it('should extract the nested error message from a stringified JSON in the message field', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    timestamp: '2025-05-06T12:11:18.224+0000',
                    status: 409,
                    error: 'Conflict',
                    message: JSON.stringify({
                        entry: {
                            code: 409,
                            message: 'Invalid jsonPatch variable mapping',
                        },
                    }),
                    path: '/v1/forms/form-09b55392-4a84-4328-9bfd-739847619c7d/submit/versions/2',
                })
            );

            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith('Invalid jsonPatch variable mapping');
        });
    });

    describe('onExecuteOutcome', () => {
        it('should show info notification when custom outcome button is clicked', () => {
            const showInfoSpy = spyOn(notificationService, 'showInfo');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, {
                id: 'custom1',
                name: outcomeName,
            });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION', undefined, { outcome: 'Custom Action' });
        });

        it('should NOT dispatch snackbar notification when a system button is clicked', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, {
                id: 'custom1',
                name: outcomeName,
                isSystem: true,
            });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });

    describe('openNextTask', () => {
        it('should navigate to the next task if available', () => {
            const mockTaskList = {
                list: {
                    entries: [{ id: '1', assignee: 'user-1', status: 'ASSIGNED', createdDate: '2025-01-01T00:00:00Z' }],
                },
            };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValue(of(mockTaskList));
            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.isNextTaskCheckboxChecked = true;
            component.onCompleteTaskForm();

            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '1' }));
        });

        it('should show an error when the checkbox is checked but no next task is available', () => {
            const mockTaskList = { list: { entries: [] } };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValue(of(mockTaskList));
            const showInfoSpy = spyOn(notificationService, 'showInfo');
            const routerSpy = spyOn(router, 'navigateByUrl');

            component.isNextTaskCheckboxChecked = true;
            component.onCompleteTaskForm();

            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.SNACKBAR.NO_NEXT_TASK_AVAILABLE');
            expect(routerSpy).toHaveBeenCalledWith('/task-list-cloud?filterId=mockId');
        });

        it('should show an error when the next assigned task is the already completed task and there are no claimable tasks', () => {
            const alreadyCompletedTaskId = '1';

            const mockAssignedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = { list: { entries: [{ id: alreadyCompletedTaskId }] } };
            const mockCreatedTaskList = {};

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));

            const showInfoSpy = spyOn(notificationService, 'showInfo');
            const routerSpy = spyOn(router, 'navigateByUrl');

            component.isNextTaskCheckboxChecked = true;
            component.taskId = alreadyCompletedTaskId;
            component.onCompleteTaskForm();

            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.SNACKBAR.NO_NEXT_TASK_AVAILABLE');
            expect(routerSpy).toHaveBeenCalledWith('/task-list-cloud?filterId=mockId');
        });

        it('should show an error when the next claimable task is the already completed task and there are no assigned tasks', () => {
            const alreadyCompletedTaskId = '1';

            const mockAssignedTaskList = {};
            const mockCreatedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = { list: { entries: [{ id: alreadyCompletedTaskId }] } };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));

            const showInfoSpy = spyOn(notificationService, 'showInfo');
            const routerSpy = spyOn(router, 'navigateByUrl');

            component.isNextTaskCheckboxChecked = true;
            component.taskId = alreadyCompletedTaskId;
            component.onCompleteTaskForm();

            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.SNACKBAR.NO_NEXT_TASK_AVAILABLE');
            expect(routerSpy).toHaveBeenCalledWith('/task-list-cloud?filterId=mockId');
        });

        it('should select assigned task different then the already completed task ', () => {
            const alreadyCompletedTaskId = '1';

            const mockAssignedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = {
                list: { entries: [{ id: alreadyCompletedTaskId }, { id: '2' }] },
            };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList));

            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.isNextTaskCheckboxChecked = true;
            component.taskId = alreadyCompletedTaskId;
            component.onCompleteTaskForm();

            expect(taskListCloudService.fetchTaskList).toHaveBeenCalledTimes(1);
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '2' }));
        });

        it('should select claimable task different then the already completed task and there are no assigned tasks', () => {
            const alreadyCompletedTaskId = '1';

            const mockAssignedTaskList = {};
            const mockCreatedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = {
                list: { entries: [{ id: alreadyCompletedTaskId }, { id: '2' }] },
            };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));
            spyOn(taskCloudService, 'canClaimTask').and.returnValue(true);
            spyOn(taskCloudService, 'claimTask').and.returnValue(of({}));

            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.isNextTaskCheckboxChecked = true;
            component.taskId = alreadyCompletedTaskId;
            component.onCompleteTaskForm();

            expect(taskListCloudService.fetchTaskList).toHaveBeenCalledTimes(2);
            expect(taskCloudService.canClaimTask).toHaveBeenCalled();
            expect(taskCloudService.claimTask).toHaveBeenCalled();
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '2' }));
        });

        it('should select claimable task when the only assigned task is the already completed one', () => {
            const alreadyCompletedTaskId = '1';

            const mockAssignedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = { list: { entries: [{ id: alreadyCompletedTaskId }] } };
            const mockCreatedTaskList: { list: { entries: TaskDetailsCloudModel[] } } = { list: { entries: [{ id: '2' }] } };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));

            const storeDispatchSpy = spyOn(store, 'dispatch');
            spyOn(taskCloudService, 'canClaimTask').and.returnValue(true);
            spyOn(taskCloudService, 'claimTask').and.returnValue(of({}));

            component.isNextTaskCheckboxChecked = true;
            component.taskId = alreadyCompletedTaskId;
            component.onCompleteTaskForm();

            expect(taskListCloudService.fetchTaskList).toHaveBeenCalledTimes(2);
            expect(taskCloudService.canClaimTask).toHaveBeenCalled();
            expect(taskCloudService.claimTask).toHaveBeenCalled();
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '2' }));
        });

        it('should prioritize assigned tasks over queued tasks', () => {
            const mockAssignedTaskList = {
                list: {
                    entries: [{ id: '1', assignee: 'user-1', status: 'ASSIGNED', createdDate: '2025-01-01T00:00:00Z' }],
                },
            };
            const mockCreatedTaskList = {
                list: {
                    entries: [{ id: '2', assignee: 'user-1', status: 'CREATED', createdDate: '2025-01-01T00:00:00Z' }],
                },
            };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));

            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.isNextTaskCheckboxChecked = true;
            component.onCompleteTaskForm();

            expect(taskListCloudService.fetchTaskList).toHaveBeenCalledTimes(1);
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '1' }));
        });

        it('should navigate to the first created task if no assigned task is available', () => {
            const mockAssignedTaskList = { list: {} };
            const mockCreatedTaskList = {
                list: {
                    entries: [{ id: '2', assignee: 'user-1', status: 'CREATED', createdDate: '2025-01-01T00:00:00Z' }],
                },
            };

            spyOn(taskListCloudService, 'fetchTaskList').and.returnValues(of(mockAssignedTaskList), of(mockCreatedTaskList));
            spyOn(taskCloudService, 'canClaimTask').and.returnValue(true);
            spyOn(taskCloudService, 'claimTask').and.returnValue(of({}));

            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.isNextTaskCheckboxChecked = true;
            component.onCompleteTaskForm();

            expect(taskListCloudService.fetchTaskList).toHaveBeenCalledTimes(2);
            expect(taskCloudService.canClaimTask).toHaveBeenCalled();
            expect(taskCloudService.claimTask).toHaveBeenCalled();
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToTaskDetails({ taskId: '2' }));
        });
    });

    describe('onCompleteTaskForm', () => {
        let openNextTaskSpy: jasmine.Spy;

        beforeEach(() => {
            openNextTaskSpy = spyOn<any>(component, 'openNextTask');
            spyOn(store, 'dispatch');
            spyOn(notificationService, 'showInfo');
        });

        it('should show a notification when the task is completed', () => {
            component.onCompleteTaskForm();

            expect(notificationService.showInfo).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED');
        });

        it('should call openNextTask if the checkbox is checked', () => {
            component.isNextTaskCheckboxChecked = true;

            component.onCompleteTaskForm();

            expect(openNextTaskSpy).toHaveBeenCalled();
        });

        it('should call openNextTask if openNextTask is passed as true', () => {
            component.onCompleteTaskForm(true);

            expect(openNextTaskSpy).toHaveBeenCalled();
        });

        it('should dispatch taskCompletedRedirection if the checkbox is not checked and openNextTask is not passed', () => {
            component.isNextTaskCheckboxChecked = false;
            component.taskId = '123';

            component.onCompleteTaskForm();

            expect(store.dispatch).toHaveBeenCalledWith(taskCompletedRedirection({ taskId: '123' }));
        });
    });
});
