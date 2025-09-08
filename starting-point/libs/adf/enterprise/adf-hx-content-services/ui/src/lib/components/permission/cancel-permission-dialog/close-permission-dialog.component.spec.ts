/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import { ClosePermissionDialogComponent } from './close-permission-dialog.component';
import { configureTestingModule, mockDismissPermissionDialogDataWithRef } from './configure-testing-module.util';

describe('ClosePermissionComponent', () => {
    let component: ClosePermissionDialogComponent;
    let fixture: ComponentFixture<ClosePermissionDialogComponent>;

    beforeEach(() => {
        configureTestingModule(mockDismissPermissionDialogDataWithRef);

        fixture = TestBed.createComponent(ClosePermissionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should close the dialog when `close without saving` is clicked', () => {
        const spyRejectButton = jest.spyOn(component, 'reject');
        const dialogRef = TestBed.inject(MatDialogRef);
        const spy = jest.spyOn(dialogRef, 'close');
        const rejectButton = fixture.debugElement.query(By.css('.hxp-permission-dialog-reject-button'));
        rejectButton.nativeElement.click();

        expect(spyRejectButton).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should close the dialog when `Save` is clicked', () => {
        const spyConfirm = jest.spyOn(component, 'confirm');
        const dialogRef = TestBed.inject(MatDialogRef);
        const spyCloseDialog = jest.spyOn(dialogRef, 'close');
        const confirmButton = fixture.debugElement.query(By.css('.hxp-permission-dialog-confirm-button'));
        confirmButton.nativeElement.click();

        expect(spyConfirm).toHaveBeenCalled();
        expect(spyCloseDialog).toHaveBeenCalled();
    });
});
