/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { DiscardChangesDialogComponent } from './discard-changes-dialog';

class MatDialogRefMock {
    close(value: any) {
        return value;
    }
}

describe('DiscardChangesDialogComponent', () => {
    let fixture: ComponentFixture<DiscardChangesDialogComponent>;
    let dialogRef: MatDialogRefMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
        });

        fixture = TestBed.createComponent(DiscardChangesDialogComponent);
        dialogRef = TestBed.inject(MatDialogRef) as unknown as MatDialogRefMock;
        fixture.detectChanges();
    });

    it('should call dialog close with undefined when cancel is clicked', fakeAsync(() => {
        const cancelButton = select<HTMLInputElement>('[data-automation-id="idp-discard-dialog__cancel-button"]');

        spyOn(dialogRef, 'close');
        cancelButton.click();

        flush();

        expect(dialogRef.close).toHaveBeenCalledWith('');
    }));

    it('should call dialog close with undefined when x is clicked', fakeAsync(() => {
        const xButton = select<HTMLButtonElement>('[data-automation-id="idp-discard-dialog__x-button"]');

        spyOn(dialogRef, 'close');
        xButton.click();

        flush();

        expect(dialogRef.close).toHaveBeenCalledWith('');
    }));

    it('should call dialog close with true when discard is clicked', fakeAsync(() => {
        const discardButton = select<HTMLButtonElement>('[data-automation-id="idp-discard-dialog__discard-button"]');

        spyOn(dialogRef, 'close');
        discardButton.click();

        flush();

        expect(dialogRef.close).toHaveBeenCalledWith(true);
    }));

    function select<T>(selector: string): T {
        return fixture.debugElement.nativeElement.querySelector(selector) as T;
    }
});
