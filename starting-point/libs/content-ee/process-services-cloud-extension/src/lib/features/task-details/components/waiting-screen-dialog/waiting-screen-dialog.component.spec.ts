/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingScreenDialogComponent } from './waiting-screen-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('WaitingScreenDialogComponent', () => {
    let component: WaitingScreenDialogComponent;
    let fixture: ComponentFixture<WaitingScreenDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WaitingScreenDialogComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
        });

        fixture = TestBed.createComponent(WaitingScreenDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should close the dialog when close method is called', () => {
        component.dialogRef.close();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
