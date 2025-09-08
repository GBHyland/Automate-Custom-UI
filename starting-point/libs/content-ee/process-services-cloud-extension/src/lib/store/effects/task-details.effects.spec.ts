/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { hot } from 'jasmine-marbles';
import { MatDialogModule } from '@angular/material/dialog';
import { TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { Store } from '@ngrx/store';

import {
    assignTask,
    openTaskAssignmentDialog,
    taskAssignmentSuccess,
    taskAssignmentFailure,
    startFormCompletedRedirection,
    taskCompletedRedirection,
} from '../actions/task-details.actions';
import { assignedTaskDetailsCloudMock } from '../../features/task-details/mock/task-details.mock';
import { DialogService } from '../../services/dialog.service';
import { TaskDetailsEffects } from './task-details.effects';
import { NotificationService, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskRedirectionService } from '../../services/task-redirection.service';
import { provideMockStore } from '@ngrx/store/testing';

describe('TaskDetailsEffects', () => {
    let actions$: Observable<any>;
    let store: Store<any>;
    let effects: TaskDetailsEffects;
    let dialogService: DialogService;
    let taskCloudService: TaskCloudService;
    let openTaskAssignmentDialogSpy: jasmine.Spy;
    let notificationService: NotificationService;
    let assignSpy: jasmine.Spy;
    let taskRedirectionService: TaskRedirectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAuthModule, MatDialogModule, MatSnackBarModule],
            providers: [
                provideMockStore(),
                TaskDetailsEffects,
                provideMockActions(() => actions$),
                {
                    provide: TaskRedirectionService,
                    useValue: {
                        redirectForStartProcess: () => {},
                        redirectForTask: () => {},
                    },
                },
            ],
        });

        store = TestBed.inject(Store);
        effects = TestBed.inject(TaskDetailsEffects);
        taskCloudService = TestBed.inject(TaskCloudService);
        dialogService = TestBed.inject(DialogService);
        notificationService = TestBed.inject(NotificationService);
        taskRedirectionService = TestBed.inject(TaskRedirectionService);

        const dialogReturnValue: any = {
            afterClosed() {
                return of();
            },
        };
        openTaskAssignmentDialogSpy = spyOn(dialogService, 'openTaskAssignmentDialog').and.returnValue(dialogReturnValue);
        assignSpy = spyOn(taskCloudService, 'assign').and.returnValue(of(assignedTaskDetailsCloudMock));
    });

    it('should open change assignee dialog on openTaskAssignmentDialog action', (done) => {
        actions$ = of(openTaskAssignmentDialog({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }));
        effects.openTaskAssignmentDialog$.subscribe(() => {
            expect(openTaskAssignmentDialogSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should call assign api on assignTask action dispatch', () => {
        actions$ = hot('-a-', { a: assignTask({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }) });

        const expected$ = hot('-b-', {
            b: {
                type: '[TaskDetails] Assign Task',
                appName: 'mock-appName',
                taskId: 'mock-id',
                assignee: 'mock-assignee',
            },
        });
        expect(effects.assignTask$).toBeObservable(expected$);
        expect(assignSpy).toHaveBeenCalledWith('mock-appName', 'mock-id', 'mock-assignee');
    });

    it('should dispatch taskAssignmentSuccess if task assignee changed successfully', () => {
        actions$ = hot('-a-', { a: assignTask({ appName: 'mock-appName', taskId: 'mock-id', assignee: 'mock-assignee' }) });
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

        effects.assignTask$.subscribe(() => {
            expect(dispatchSpy).toHaveBeenCalledWith(taskAssignmentSuccess());
        });
    });

    it('Should show info notification on taskAssignmentSuccess action', async () => {
        actions$ = of(taskAssignmentSuccess());
        const notificationServiceSpy = spyOn(notificationService, 'showInfo');

        await firstValueFrom(effects.taskAssignmentSuccess$);

        expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.SUCCESS');
    });

    it('Should show error notification on taskAssignmentFailure action', async () => {
        actions$ = of(taskAssignmentFailure({ error: '' }));
        const notificationServiceSpy = spyOn(notificationService, 'showError');

        await effects.taskAssignmentFailure$.toPromise();

        expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.FAILED');
    });

    it('should call redirectForStartProcess when startFormRedirection action', () => {
        actions$ = hot('-a-', {
            a: startFormCompletedRedirection({ appName: 'mock-appName', processDefinitionName: 'mock-process', redirectParameter: 'mock-parameter' }),
        });
        const taskRedirectionSpy = spyOn(taskRedirectionService, 'redirectForStartProcess').and.callThrough();

        effects.startFormRedirection$.subscribe(() => {
            expect(taskRedirectionSpy).toHaveBeenCalledWith('mock-appName', 'mock-process', 'mock-parameter');
        });
    });

    it('should call redirectForTask when startFormRedirection action', () => {
        actions$ = hot('-a-', { a: taskCompletedRedirection({ taskId: 'mock-taskId' }) });
        const taskRedirectionSpy = spyOn(taskRedirectionService, 'redirectForTask').and.callThrough();

        effects.taskCompletedRedirection$.subscribe(() => {
            expect(taskRedirectionSpy).toHaveBeenCalledWith('mock-taskId');
        });
    });
});
