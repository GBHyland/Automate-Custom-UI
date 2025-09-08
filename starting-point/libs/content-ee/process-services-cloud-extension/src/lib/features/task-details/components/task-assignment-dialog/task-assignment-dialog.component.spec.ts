/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { TaskAssignmentDialogComponent } from './task-assignment-dialog.component';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogSection } from '@angular/material/dialog/testing';
import { ChipHarnessUtils, ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { By } from '@angular/platform-browser';
import { IdentityUserModel } from '@alfresco-dbp/shared/identity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskAssignmentDialogComponent - Content', () => {
    let component: TaskAssignmentDialogComponent;
    let fixture: ComponentFixture<TaskAssignmentDialogComponent>;
    let taskAssignmentService: TaskAssignmentService;
    let searchSpy: jasmine.Spy;

    const mockUsers = [{ username: 'user1' }, { username: 'user2' }];

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    const mockDialogData = {
        appName: 'mock-Application-name',
        taskId: 'mock-task-id',
        assignee: 'mock-user-name',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, NoopAuthModule, TaskAssignmentDialogComponent],
            providers: [
                TaskAssignmentService,
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
        });

        fixture = TestBed.createComponent(TaskAssignmentDialogComponent);
        component = fixture.componentInstance;
        taskAssignmentService = TestBed.inject(TaskAssignmentService);
        searchSpy = spyOn(taskAssignmentService, 'search').and.returnValue(of(mockUsers));

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should be defined identity-people', () => {
        const identityPeople = fixture.debugElement.nativeElement.querySelector('identity-people');
        const searchInputElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="ama-identity-people-search-input"]');

        expect(identityPeople).toBeTruthy();
        expect(searchInputElement).toBeTruthy();
    });

    it('should get appName from MAT_DIALOG_DATA as an input to the dialog', () => {
        const mockData = component.settings;

        expect(mockData).toEqual(mockDialogData);
        expect(mockData.appName).toEqual('mock-Application-name');
    });

    it('should display title', () => {
        const titleElement = fixture.debugElement.query(By.css(MatDialogSection.TITLE)).nativeElement.textContent.trim();

        expect(titleElement).toEqual('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.TITLE');
    });

    it('should be able to close dialog when close button is clicked', async () => {
        await ButtonHarnessUtils.clickButton({ fixture, buttonFilters: { selector: '#closeButton' } });

        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('Should be able to call dialog close with selected user on click of assign button', async () => {
        searchSpy.and.returnValue(of([]));
        const selectedUser = <IdentityUserModel>{ username: 'mock-selected-name' };
        component.onSelect(selectedUser);
        fixture.detectChanges();

        await ButtonHarnessUtils.clickButton({ fixture, buttonFilters: { selector: '#assignButton' } });

        expect(mockDialogRef.close).toHaveBeenCalledWith(selectedUser);
    });

    it('Should enable assign button if a selected user different from current assignee', async () => {
        component.onSelect({ username: 'mock-new-assignee' });
        fixture.detectChanges();

        const assignButton = await ButtonHarnessUtils.getButton({ fixture, buttonFilters: { selector: '#assignButton' } });

        expect(await assignButton.isDisabled()).toBeFalsy();
    });

    it('Should disable assign button if current assignee is selected', async () => {
        const selectedUser = <IdentityUserModel>{ username: 'mock-user-name' };
        component.onSelect(selectedUser);
        fixture.detectChanges();

        const assignButton = await ButtonHarnessUtils.getButton({ fixture, buttonFilters: { selector: '#assignButton' } });

        expect(await assignButton.isDisabled()).toBeTruthy();
    });

    it('Should current assignee be removable', async () => {
        const selectedUserChip = await ChipHarnessUtils.getChipRow({ fixture });
        const selectedUserChipRemoveButton = await selectedUserChip.getRemoveButton();

        expect(selectedUserChipRemoveButton).toBeTruthy();
    });

    it('Should disable assign button when assignee removed', async () => {
        const selectedUserChip = await ChipHarnessUtils.getChipRow({ fixture });
        await selectedUserChip.remove();

        const assignButton = await ButtonHarnessUtils.getButton({ fixture, buttonFilters: { selector: '#assignButton' } });
        expect(await assignButton.isDisabled()).toBeTruthy();
    });
});
