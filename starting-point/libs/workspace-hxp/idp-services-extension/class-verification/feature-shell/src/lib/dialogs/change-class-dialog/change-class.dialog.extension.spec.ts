/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ChangeClassListDialogComponent } from './change-class.dialog';
import { openChangeClassListDialog, ChangeClassListDialogData } from './change-class.dialog.extension';

describe('openChangeClassListDialog', () => {
    let matDialogMock: any;
    let dialogRefMock: any;

    beforeEach(() => {
        dialogRefMock = {
            afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of('result')),
        };

        matDialogMock = {
            open: jasmine.createSpy('open').and.returnValue(dialogRefMock),
        };

        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: matDialogMock }],
        });
    });

    it('should open the dialog with the correct configuration', () => {
        const dialogData: ChangeClassListDialogData = { currentClassId: '123' };
        const onDialogClose = jasmine.createSpy('onDialogClose');
        const config: MatDialogConfig = { width: '50%', height: '70%' };

        openChangeClassListDialog(matDialogMock, dialogData, onDialogClose, config);

        expect(matDialogMock.open).toHaveBeenCalledWith(
            ChangeClassListDialogComponent,
            jasmine.objectContaining({
                data: dialogData,
                width: '50%',
                height: '70%',
                autoFocus: '.idp-filterable-selection-list__search-field-input',
                restoreFocus: true,
            })
        );
    });

    it('should call onDialogClose with the result when the dialog is closed', () => {
        const dialogData: ChangeClassListDialogData = { currentClassId: '123' };
        const onDialogClose = jasmine.createSpy('onDialogClose');

        openChangeClassListDialog(matDialogMock, dialogData, onDialogClose);

        expect(dialogRefMock.afterClosed).toHaveBeenCalled();
        expect(onDialogClose).toHaveBeenCalledWith('result');
    });

    it('should not call onDialogClose if the dialog is closed without a result', () => {
        dialogRefMock.afterClosed.and.returnValue(of());
        const dialogData: ChangeClassListDialogData = { currentClassId: '123' };
        const onDialogClose = jasmine.createSpy('onDialogClose');

        openChangeClassListDialog(matDialogMock, dialogData, onDialogClose);

        expect(dialogRefMock.afterClosed).toHaveBeenCalled();
        expect(onDialogClose).not.toHaveBeenCalled();
    });
});
