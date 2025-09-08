/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { merge, Observable, of } from 'rxjs';
import { ScreenEffects } from './screen.effects';
import { ProcessTaskBackendService, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { Action } from '@ngrx/store';
import { idpConfiguration, taskContext, taskData } from '../shared-mock-states';
import { NotificationService } from '@alfresco/adf-core';
import { hot, cold, getTestScheduler } from 'jasmine-marbles';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdpTaskData } from '../../models/screen-models';
import { selectTaskInfo } from '../selectors/screen.selectors';

describe('ScreenEffects', () => {
    let actions$: Observable<Action>;
    let effects: ScreenEffects;
    let store: MockStore;
    let processTaskService: jasmine.SpyObj<ProcessTaskBackendService>;

    const mockIdpConfiguration = { ...idpConfiguration };
    const mockTaskData = { ...taskData, rootProcessInstanceId: '' };

    const notificationSpy = jasmine.createSpyObj(
        'NotificationService',
        {
            showError: {},
            showWarning: {},
            showInfo: {},
        },
        {}
    );

    beforeEach(() => {
        processTaskService = jasmine.createSpyObj(
            'ProcessTaskBackendService',
            {
                getTaskAssignee$: of('testUser'),
                getTaskInputData$: of(mockTaskData),
                getIdpConfiguration$: of(mockIdpConfiguration),
                completeTask$: of({}),
                saveTaskData$: of({}),
                claimTask$: of(true),
                unclaimTask$: of(true),
                getTaskClaimProperties$: of({ success: true, canClaimTask: false, canUnclaimTask: true }),
            },
            {}
        );

        TestBed.configureTestingModule({
            providers: [
                ScreenEffects,
                provideMockActions(() => actions$),
                provideMockStore(),
                { provide: ProcessTaskBackendService, useValue: processTaskService },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });

        effects = TestBed.inject(ScreenEffects);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should fetch task input and task configuration on screen load', () => {
        const expectedTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadSuccess({ taskData: expectedTaskData, taskContext });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should emit screen load error action when task input data retrieval fails', () => {
        const error = new Error('Error fetching task data');
        processTaskService.getTaskInputData$.and.returnValue(cold('#', {}, error));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should emit screen load error action when task configuration retrieval fails', () => {
        const error = new Error('Error fetching task configuration');
        processTaskService.getIdpConfiguration$.and.returnValue(cold('#', {}, error));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should emit screen load error action when document index is lesser than 0', () => {
        const testTaskData = { ...mockTaskData, documentIndex: -1 };
        processTaskService.getTaskInputData$.and.returnValue(of(testTaskData));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error: new TypeError('Invalid document index - -1') });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should emit screen load error action when document index is more than total document length', () => {
        const testTaskData = { ...mockTaskData, documentIndex: 10 };
        processTaskService.getTaskInputData$.and.returnValue(of(testTaskData));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error: new TypeError('Invalid document index - 10') });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should send errors to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'error';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showError).toHaveBeenCalled();
    });

    it('should send warnings to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'warn';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showWarning).toHaveBeenCalled();
    });

    it('should send info to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'info';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showInfo).toHaveBeenCalled();
    });

    it('should handle task action error', () => {
        const error = new Error('Test Error');
        actions$ = hot('a', { a: systemActions.taskActionError({ error }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_ACTION_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should handle save task action error', () => {
        actions$ = hot('a', { a: systemActions.taskActionError({ error: 'err', action: 'Save' }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_SAVE_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should handle complete task action error', () => {
        actions$ = hot('a', { a: systemActions.taskActionError({ error: 'err', action: 'Complete' }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_COMPLETE_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should handle task cancel', () => {
        actions$ = hot('a', { a: userActions.taskCancel() });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Cancel' }) });
        expect(effects.cancelTaskEffect$).toBeObservable(expected);
    });

    it('should trigger task data preparation when task save action emits', () => {
        actions$ = hot('a', { a: userActions.taskSave() });
        const expected = cold('b', { b: systemActions.taskPrepareUpdate({ taskAction: 'Save' }) });
        expect(effects.saveTaskPrepareDataEffect$).toBeObservable(expected);
    });

    it('should trigger task data preparation when task complete action emits', () => {
        actions$ = hot('a', { a: userActions.taskComplete({}) });
        const expected = cold('b', { b: systemActions.taskPrepareUpdate({ taskAction: 'Complete', openNextTask: undefined }) });
        expect(effects.completeTaskPrepareDataEffect$).toBeObservable(expected);
    });

    it('should make api call to save task when prepare update action emits with save action', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const outcome = systemActions.taskActionSuccess({ action: 'Save' });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Save', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
        expect(processTaskService.saveTaskData$).toHaveBeenCalledWith(taskContext.appName, taskContext.taskId, {
            batchState: testTaskData.batchState,
            sys_task_assignee: testTaskData.sys_task_assignee,
        });
    });

    it('should make api call to complete task when prepare update action emits with complete action', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const outcome = systemActions.taskActionSuccess({ action: 'Complete', openNextTask: undefined });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
        expect(processTaskService.completeTask$).toHaveBeenCalledWith(taskContext.appName, taskContext.taskId, {
            batchState: testTaskData.batchState,
            sys_task_assignee: testTaskData.sys_task_assignee,
        });
    });

    it('should emit task action error when prepare update action emits neither save or complete action', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const outcome = systemActions.taskActionError({ error: new Error('Unknown task action') });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Cancel', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should dispatch task action error when save task is unsuccessful', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        processTaskService.saveTaskData$.and.returnValue(of(false));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Save', taskData: testTaskData }) });
        const outcome = systemActions.taskActionError({ action: 'Save', error: jasmine.any(String) as any });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should dispatch task action error when save task throws error', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const error = new Error('Test Save Error');
        processTaskService.saveTaskData$.and.returnValue(cold('#', {}, error));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Save', taskData: testTaskData }) });
        const outcome = systemActions.taskActionError({ action: 'Save', error });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should dispatch task action error when complete task is unsuccessful', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        processTaskService.completeTask$.and.returnValue(of(false));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: testTaskData }) });
        const outcome = systemActions.taskActionError({ action: 'Complete', error: jasmine.any(String) as any });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should dispatch task action error when complete task throws error', () => {
        const testTaskData: IdpTaskData = {
            ...mockTaskData,
            classificationConfiguration: mockIdpConfiguration.classification,
            extractionConfiguration: mockIdpConfiguration.extraction,
        };
        const error = new Error('Test Complete Error');
        processTaskService.completeTask$.and.returnValue(cold('#', {}, error));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: testTaskData }) });
        const outcome = systemActions.taskActionError({ action: 'Complete', error });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should handle task claim', () => {
        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskClaimSuccess({ taskContext: { ...taskContext, canClaimTask: false, canUnclaimTask: true } }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when app name or task id is empty', () => {
        const cases = [
            { caseTaskContext: { appName: 'test-app-name', taskId: '' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: 'test-task-id' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: '' } as TaskContext },
        ];

        for (const { caseTaskContext } of cases) {
            actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext: caseTaskContext }) });
            const expected = cold('b', {
                b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
            });

            expect(effects.claimTaskEffect$).toBeObservable(expected);
        }
    });

    it('should return taskActionError from task claim when claimTask throws an error', () => {
        processTaskService.claimTask$.and.returnValue(cold('#', {}, new Error('Test Claim Error')));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Claim Error'), action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when claimTask$ is unsuccessful', () => {
        processTaskService.claimTask$.and.returnValue(of(false));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when getTaskClaimProperties$ throws an error', () => {
        processTaskService.getTaskClaimProperties$.and.returnValue(cold('#', {}, new Error('Test Claim Error')));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Claim Error'), action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when getTaskClaimProperties$ is unsuccessful', () => {
        processTaskService.getTaskClaimProperties$.and.returnValue(of({ success: false }));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should handle claim task action error', () => {
        const ogConsoleError = console.error;
        console.error = () => {};

        const error = new Error('Test Claim Error');

        const combined$ = merge(effects.taskActionErrorNotificationEffect$, effects.taskClaimErrorCancelTaskEffect$);

        actions$ = hot('       a', { a: systemActions.taskActionError({ error, action: 'Claim' }) });
        const expected = cold('(bc)', {
            b: systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_CLAIM_ERROR' }),
            c: systemActions.taskActionSuccess({ action: 'Cancel' }),
        });

        expect(combined$).toBeObservable(expected);

        console.error = ogConsoleError;
    });

    it('should handle task unclaim', () => {
        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Unclaim' }) });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task unclaim when app name or task id is empty', () => {
        const cases = [
            { caseTaskContext: { appName: 'test-app-name', taskId: '' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: 'test-task-id' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: '' } as TaskContext },
        ];

        for (const { caseTaskContext } of cases) {
            store.overrideSelector(selectTaskInfo, caseTaskContext);

            actions$ = hot('       a', { a: systemActions.taskUnclaim() });
            const expected = cold('b', {
                b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Unclaim' }),
            });

            expect(effects.unclaimTaskEffect$).toBeObservable(expected);
        }
    });

    it('should return taskActionError from task unclaim when claimTask throws an error', () => {
        processTaskService.unclaimTask$.and.returnValue(cold('#', {}, new Error('Test Unclaim Error')));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Unclaim Error'), action: 'Unclaim' }),
        });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task unclaim when unclaimTask$ is unsuccessful', () => {
        processTaskService.unclaimTask$.and.returnValue(of(false));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Unclaim' }),
        });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should handle unclaim task action error', () => {
        const ogConsoleError = console.error;
        console.error = () => {};

        const error = new Error('Test Unclaim Error');
        actions$ = hot('       a', { a: systemActions.taskActionError({ error, action: 'Unclaim' }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_UNCLAIM_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);

        console.error = ogConsoleError;
    });

    it('should trigger taskActionSuccess when taskClaimSuccess action emits', () => {
        actions$ = hot('a', { a: systemActions.taskClaimSuccess({ taskContext }) });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Claim' }) });
        expect(effects.taskActionClaimSuccessEffect$).toBeObservable(expected);
    });

    it('should trigger screenLoad when taskClaimSuccess action emits', () => {
        actions$ = hot('a', { a: systemActions.taskClaimSuccess({ taskContext }) });
        const expected = cold('b', { b: systemActions.screenLoad({ taskContext }) });
        expect(effects.taskClaimSuccessLoadScreenEffect$).toBeObservable(expected);
    });

    it('should dispatch task action error on task prepare update error', () => {
        const error = new Error('Test Task Data Prepare Update Error');
        actions$ = hot('a', { a: systemActions.taskPrepareUpdateError({ taskAction: 'Save', error }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error }),
        });
        expect(effects.taskPrepareDataErrorEffect$).toBeObservable(expected);
    });

    it('should dispatch task claim on screen initialize when task can be claimed', () => {
        const claimableTaskContext = { ...taskContext, canClaimTask: true, canUnclaimTask: false };

        actions$ = hot('a', { a: systemActions.screenInitialize({ taskContext: claimableTaskContext }) });
        const expected = cold('b', { b: systemActions.taskClaim({ taskContext: claimableTaskContext }) });

        expect(effects.initializeScreenEffect$).toBeObservable(expected);
    });

    it('should dispatch screen load on screen initialize when task is assigned', () => {
        const assignedTaskContext = { ...taskContext, canClaimTask: false, canUnclaimTask: true };
        processTaskService.getTaskAssignee$.and.returnValue(of('test-user'));

        actions$ = hot('a', { a: systemActions.screenInitialize({ taskContext: assignedTaskContext }) });
        const expected = cold('b', { b: systemActions.screenLoad({ taskContext: assignedTaskContext }) });

        expect(effects.initializeScreenEffect$).toBeObservable(expected);
    });

    it('should dispatch screen initialize error on screen initialize when task cannot be claimed', () => {
        const assignedTaskContext = { ...taskContext, canClaimTask: false, canUnclaimTask: false };
        processTaskService.getTaskAssignee$.and.returnValue(of(undefined));

        actions$ = hot('a', { a: systemActions.screenInitialize({ taskContext: assignedTaskContext }) });
        const expected = cold('b', { b: systemActions.screenInitializeError({ error: jasmine.any(String) as any }) });

        expect(effects.initializeScreenEffect$).toBeObservable(expected);
    });

    it('should dispatch screen initialize error on screen initialize when get assignee throws an error', () => {
        const assignedTaskContext = { ...taskContext, canClaimTask: false, canUnclaimTask: false };
        processTaskService.getTaskAssignee$.and.returnValue(cold('#', {}, new Error('Test Get Assignee Error')));

        actions$ = hot('a', { a: systemActions.screenInitialize({ taskContext: assignedTaskContext }) });
        const expected = cold('b', { b: systemActions.screenInitializeError({ error: jasmine.any(String) as any }) });

        expect(effects.initializeScreenEffect$).toBeObservable(expected);
    });

    it('should dispatch notification show on screen initialize error', () => {
        const error = 'Test Screen Initialize Error';
        actions$ = hot('a', { a: systemActions.screenInitializeError({ error }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: error }),
        });

        expect(effects.initializeScreenErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should dispatch notification show with generic message on screen initialize error when error is of type Error', () => {
        const error = new Error('Test Screen Initialize Error');
        actions$ = hot('a', { a: systemActions.screenInitializeError({ error }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: jasmine.stringMatching(/.+\.SCREEN_INIT_ERROR/) as any }),
        });

        expect(effects.initializeScreenErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should dispatch task cancel on screen initialize error', () => {
        const error = new Error('Test Screen Initialize Error');
        actions$ = hot('a', { a: systemActions.screenInitializeError({ error }) });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Cancel' }) });

        expect(effects.initializeScreenErrorCancelTaskEffect$).toBeObservable(expected);
    });
});
