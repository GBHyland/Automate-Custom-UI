/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { IdpDedicatedScreenBaseComponent } from './dedicated-screen-base.component';
import { IdpContextTaskBaseService } from '../services/context-task/context-task-base.service';
import { IdpTaskActions, IdpTaskInfoBase } from '../models/common-models';
import { Component } from '@angular/core';

@Component({
    selector: 'hyland-idp-test-screen',
    standalone: true,
    template: '',
})
class TestScreenComponent extends IdpDedicatedScreenBaseComponent {}

const mockTaskActions$ = new Subject<{ action: IdpTaskActions; openNextTask?: boolean }>();
const mockTaskInfo$ = new Subject<IdpTaskInfoBase>();
class MockIdpContextTaskBaseService {
    taskAction$ = mockTaskActions$.asObservable();
    taskInfo$ = mockTaskInfo$.asObservable();
    initialize = jest.fn();
    destroy = jest.fn();
    claimTask = jest.fn();
}

describe('IdpDedicatedScreenBaseComponent', () => {
    let component: IdpDedicatedScreenBaseComponent;
    let fixture: ComponentFixture<IdpDedicatedScreenBaseComponent>;
    let contextService: MockIdpContextTaskBaseService;

    beforeEach(() => {
        contextService = new MockIdpContextTaskBaseService();

        TestBed.configureTestingModule({
            imports: [TestScreenComponent],
            providers: [{ provide: IdpContextTaskBaseService, useValue: contextService }],
        });

        fixture = TestBed.createComponent(TestScreenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize context service with valid task context on input change', fakeAsync(() => {
        const testAppName = 'testApp';
        const testTaskId = '123';
        const testTaskName = 'testTask';
        const testRootProcessInstanceId = '123456';
        const testCanClaimTask = false;
        const testCanUnclaimTask = true;

        buildInputChanges(testAppName, testTaskId, testTaskName, testRootProcessInstanceId, testCanClaimTask, testCanUnclaimTask);

        flush();

        expect(contextService.initialize).toHaveBeenCalledWith({
            appName: testAppName,
            taskId: testTaskId,
            taskName: testTaskName,
            rootProcessInstanceId: testRootProcessInstanceId,
            canClaimTask: testCanClaimTask,
            canUnclaimTask: testCanUnclaimTask,
        });
    }));

    function buildInputChanges(
        appName: string,
        taskId: string,
        taskName: string,
        rootProcessInstanceId: string,
        canClaimTask: boolean,
        canUnclaimTask: boolean
    ) {
        const buildInputChange = (value: any) => ({ currentValue: value, firstChange: true, previousValue: undefined, isFirstChange: () => true });

        component.appName = appName;
        component.ngOnChanges({ appName: buildInputChange(appName) });

        component.taskId = taskId;
        component.ngOnChanges({ taskId: buildInputChange(taskId) });

        component.taskName = taskName;
        component.ngOnChanges({ taskName: buildInputChange(taskName) });

        component.canClaimTask = canClaimTask;
        component.ngOnChanges({ canClaimTask: buildInputChange(canClaimTask) });

        component.canUnclaimTask = canUnclaimTask;
        component.ngOnChanges({ canUnclaimTask: buildInputChange(canUnclaimTask) });

        component.rootProcessInstanceId = rootProcessInstanceId;
        component.ngOnChanges({ rootProcessInstanceId: buildInputChange(rootProcessInstanceId) });
    }

    it('should emit taskSaved event on Save action', () => {
        jest.spyOn(component.taskSaved, 'emit');

        mockTaskActions$.next({ action: 'Save', openNextTask: undefined });

        expect(component.taskSaved.emit).toHaveBeenCalled();
    });

    it('should emit taskCompleted event on Complete action', () => {
        jest.spyOn(component.taskCompleted, 'emit');
        const openNextTask = true;
        mockTaskActions$.next({ action: 'Complete', openNextTask: openNextTask });

        expect(component.taskCompleted.emit).toHaveBeenCalledWith(openNextTask);
    });

    it('should emit cancelTask event on Cancel action', () => {
        jest.spyOn(component.cancelTask, 'emit');

        mockTaskActions$.next({ action: 'Cancel', openNextTask: undefined });

        expect(component.cancelTask.emit).toHaveBeenCalled();
    });

    it('should update task claim properties on task info emitted', fakeAsync(() => {
        component.canClaimTask = true;
        component.canUnclaimTask = false;

        const cases = [
            { canClaimTask: true, canUnclaimTask: true },
            { canClaimTask: false, canUnclaimTask: true },
        ];

        for (const { canClaimTask, canUnclaimTask } of cases) {
            mockTaskInfo$.next({ canClaimTask, canUnclaimTask } as IdpTaskInfoBase);

            flush();

            expect(component.canClaimTask).toBe(canClaimTask);
            expect(component.canUnclaimTask).toBe(canUnclaimTask);
        }
    }));

    it('should emit unclaimTask event on Unclaim action', () => {
        jest.spyOn(component.unclaimTask, 'emit');

        mockTaskActions$.next({ action: 'Unclaim', openNextTask: undefined });

        expect(component.unclaimTask.emit).toHaveBeenCalled();
    });

    it('should clear state on init', () => {
        expect(contextService.destroy).toHaveBeenCalledTimes(1);
    });

    it('should initialize context if task name is empty', fakeAsync(() => {
        testContextServiceInitializedWithTaskName('');
    }));

    it('should initialize context if task name is not empty', fakeAsync(() => {
        testContextServiceInitializedWithTaskName('task name');
    }));

    const testContextServiceInitializedWithTaskName = (taskName: string) => {
        const testAppName = 'testApp';
        const testTaskId = '123';
        const testRootProcessInstanceId = '123456';
        const testCanClaimTask = false;
        const testCanUnclaimTask = false;

        buildInputChanges(testAppName, testTaskId, taskName, testRootProcessInstanceId, testCanClaimTask, testCanUnclaimTask);

        flush();

        expect(contextService.initialize).toHaveBeenCalledWith({
            appName: testAppName,
            taskId: testTaskId,
            taskName: taskName,
            rootProcessInstanceId: testRootProcessInstanceId,
            canClaimTask: testCanClaimTask,
            canUnclaimTask: testCanUnclaimTask,
        });
    };
});
