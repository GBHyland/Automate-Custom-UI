/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPermissionDialogComponent, DismissPermissionDialogData } from './cancel-permission-dialog.component';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    configureTestingModule,
    mockDismissPermissionDialogDataWithRef,
    mockDismissPermissionDialogDataWithoutRef,
} from './configure-testing-module.util';
import { PermissionsPanelRequestService } from '@alfresco/adf-hx-content-services/services';

describe('CancelPermissionComponent', () => {
    let component: CancelPermissionDialogComponent;
    let fixture: ComponentFixture<CancelPermissionDialogComponent>;
    let dialogData: DismissPermissionDialogData;

    const configureTest = (data: DismissPermissionDialogData) => {
        configureTestingModule(data);

        fixture = TestBed.createComponent(CancelPermissionDialogComponent);
        component = fixture.componentInstance;
        dialogData = TestBed.inject(MAT_DIALOG_DATA);
        fixture.detectChanges();
    };

    describe('with DismissPermissionDialogData', () => {
        beforeEach(() => {
            configureTest(mockDismissPermissionDialogDataWithRef);
        });

        afterEach(() => {
            (dialogData.permissionDialogRef?.close as jest.Mock).mockReset();
        });

        it('should close the cancel dialog when `continue managing` is clicked', () => {
            const spyRejectButton = jest.spyOn(component, 'reject');
            const dialogRef = TestBed.inject(MatDialogRef);
            const spy = jest.spyOn(dialogRef, 'close');
            const rejectButton = fixture.debugElement.query(By.css('.hxp-permission-dialog-reject-button'));
            rejectButton.nativeElement.click();

            expect(spyRejectButton).toHaveBeenCalled();
            expect(dialogData.permissionDialogRef?.close).not.toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });

        it('should close the both cancel and permission dialog when `cancel` is clicked', () => {
            const spyConfirmButton = jest.spyOn(component, 'confirm');
            const dialogRef = TestBed.inject(MatDialogRef);
            const spy = jest.spyOn(dialogRef, 'close');
            const confirmButton = fixture.debugElement.query(By.css('.hxp-permission-dialog-confirm-button'));
            confirmButton.nativeElement.click();

            expect(spyConfirmButton).toHaveBeenCalled();
            expect(dialogData.permissionDialogRef?.close).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('without DismissPermissionDialogData', () => {
        beforeEach(async () => {
            configureTest(mockDismissPermissionDialogDataWithoutRef);
        });

        it('should request to close the panel', () => {
            const permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);
            const spyRequestClosePanel = jest.spyOn(permissionsPanelRequestService, 'requestClosePanel');
            const confirmButton = fixture.debugElement.query(By.css('.hxp-permission-dialog-confirm-button'));
            confirmButton.nativeElement.click();

            expect(spyRequestClosePanel).toHaveBeenCalled();
        });
    });
});
