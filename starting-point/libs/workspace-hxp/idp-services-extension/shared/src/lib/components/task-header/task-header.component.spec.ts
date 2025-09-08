/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { of, Subject } from 'rxjs';
import { TaskHeaderAfterBackDirective, TaskHeaderComponent } from './task-header.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

class MatDialogMock {
    close(value: any) {
        return value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    open = jasmine.createSpy().and.returnValue({
        afterClosed: () => of(true),
    });
}

describe('TaskHeaderComponent', () => {
    let fixture: ComponentFixture<TaskHeaderComponent>;
    let component: TaskHeaderComponent;
    let contextTaskService: IdpContextTaskBaseService;
    let taskInfoSubject$: Subject<any>;

    class MockContextTaskService implements Partial<IdpContextTaskBaseService> {
        taskInfo$ = taskInfoSubject$.asObservable();
        cancelTask = jasmine.createSpy('cancelTask');
        taskCanSave$? = of(true);
    }

    beforeEach(() => {
        taskInfoSubject$ = new Subject();

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, TaskHeaderComponent],
            providers: [
                { provide: IdpContextTaskBaseService, useClass: MockContextTaskService },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        }).overrideComponent(TaskHeaderComponent, {
            remove: { imports: [MatDialogModule] },
        });

        fixture = TestBed.createComponent(TaskHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        contextTaskService = TestBed.inject(IdpContextTaskBaseService);
    });

    it('should cancel task when goBack is called and task can be saved and discard is chosen on dialog', () => {
        component.goBack();
        expect(component.dialog.open).toHaveBeenCalled();
        expect(contextTaskService.cancelTask).toHaveBeenCalled();
    });

    it('should cancel task when goBack is called and discard is chosen on dialog', () => {
        component.taskCanSave = false;
        component.goBack();
        expect(component.dialog.open).not.toHaveBeenCalled();
        expect(contextTaskService.cancelTask).toHaveBeenCalled();
    });

    it('should have headerInfo$ observable', fakeAsync(() => {
        let receivedValue: any;
        component.headerInfo$.subscribe((info) => {
            receivedValue = info;
        });

        taskInfoSubject$.next({ taskId: '1', taskName: 'Test Task' });
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '1', taskName: 'Test Task' });

        // eslint-disable-next-line unicorn/no-useless-undefined
        taskInfoSubject$.next(undefined);
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '1', taskName: 'Test Task' });

        taskInfoSubject$.next({ taskId: '2', taskName: 'Another Task' });
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '2', taskName: 'Another Task' });
    }));

    it('should set hasAfterBackContent to false when afterBackContent is not provided', () => {
        expect(component.afterBackContent).toBeUndefined();
        component.ngAfterContentInit();
        expect(component.hasAfterBackContent).toBe(false);
    });

    it('should set hasAfterBackContent to true when afterBackContent is provided', () => {
        @Component({
            template: `
                <hyland-idp-task-header>
                    <div hylandIdpTaskHeaderAfterBack>After back content</div>
                </hyland-idp-task-header>
            `,
            standalone: true,
            imports: [TaskHeaderComponent, TaskHeaderAfterBackDirective],
        })
        class TestHostComponent {}

        const hostFixture = TestBed.createComponent(TestHostComponent);
        hostFixture.detectChanges();

        const taskHeaderInstance = hostFixture.debugElement.query(By.directive(TaskHeaderComponent)).componentInstance as TaskHeaderComponent;

        expect(taskHeaderInstance.afterBackContent).toBeDefined();
        expect(taskHeaderInstance.hasAfterBackContent).toBe(true);
    });
});
