/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelFolderDialogComponent } from './cancel-folder-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HxPCreateFolderDialogComponent } from '../folder-create-dialog/folder-create-dialog.component';
import { By } from '@angular/platform-browser';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';

const createFolderDialogMock = {
    close: jasmine.createSpy(),
};
const dialogMock = {
    close: jasmine.createSpy(),
};

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'color-contrast': 1 }];

describe('CancelFolderDialogComponent', () => {
    let component: CancelFolderDialogComponent;
    let fixture: ComponentFixture<CancelFolderDialogComponent>;
    let dialogData: MatDialogRef<HxPCreateFolderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule, MatDialogModule, CancelFolderDialogComponent, HxPCreateFolderDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: createFolderDialogMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CancelFolderDialogComponent);
        component = fixture.componentInstance;
        dialogData = TestBed.inject(MAT_DIALOG_DATA);
        fixture.detectChanges();
    });

    afterEach(() => {
        (dialogData?.close as jasmine.Spy).calls.reset();
    });

    it('should close the cancel dialog when `continue creating` is clicked', () => {
        const spyContinueButton = spyOn(component, 'reject').and.callThrough();
        const continueButton = fixture.debugElement.query(By.css('.hxp-dialog-reject-button'));
        continueButton.nativeElement.click();

        expect(spyContinueButton).toHaveBeenCalled();
        expect(dialogData?.close).not.toHaveBeenCalled();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });

    it('should close the both cancel and create folder dialog when `cancel` is clicked', () => {
        const spyCancelButton = spyOn(component, 'confirm').and.callThrough();
        const confirmButton = fixture.debugElement.query(By.css('.hxp-dialog-confirm-button'));
        confirmButton.nativeElement.click();

        expect(spyCancelButton).toHaveBeenCalled();
        expect(dialogData?.close).toHaveBeenCalled();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });

    it('should pass accessibility checks', async () => {
        const res = await a11yReport('.hxp-cancel-dialog');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
