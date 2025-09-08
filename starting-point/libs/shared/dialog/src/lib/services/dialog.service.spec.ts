/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DEFAULT_DIALOG_WIDTH, DialogService } from './dialog.service';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { DialogData, MultipleChoiceDialogData } from '../interfaces/dialog.interface';
import { MultipleChoiceDialogComponent, MultipleChoiceDialogReturnType } from '../components/multiple-choice-dialog/multiple-choice-dialog.component';
import { Subject } from 'rxjs';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

describe('DialogService ', () => {
    let service: DialogService;
    const noopScrollStrategy = new NoopScrollStrategy();
    const mockDialog = {
        open: jest.fn(),
        close: jest.fn(),
        closeAll: jest.fn(),
    };
    const multipleChoiceDialogRef: MatDialogRef<MultipleChoiceDialogComponent<fakeType>> = null;
    const subjectMultipleChoice: Subject<MultipleChoiceDialogReturnType<fakeType>> = null;
    enum fakeType {
        WITH_SAVE = 'WITH_SAVE',
        WITHOUT_SAVE = 'WITHOUT_SAVE',
        ABORT = 'ABORT',
    }
    const multipleChoiceDialogData: MultipleChoiceDialogData<fakeType> = {
        choices: [{ title: 'Save', choice: fakeType.WITH_SAVE, spinnable: true }],
        subtitle: 'Do you want to save changes?',
        title: 'Are you sure?',
        ...subjectMultipleChoice,
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule],
            declarations: [],
            providers: [DialogService, { provide: MatDialog, useValue: mockDialog }],
        });
    });

    beforeEach(() => {
        service = TestBed.inject(DialogService);
        TestBed.inject(MatDialog);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('the confirm return should open a dialog', () => {
        service.confirm();

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: noopScrollStrategy,
            disableClose: true,
            data: expect.any(Object),
        });
    });

    it('check if the subject was passed down', () => {
        service.confirm();
        const args = mockDialog.open.mock.calls[0][1];
        const subject = args.data.subject;

        expect(subject).toBeDefined();
        expect(subject.next).toBeDefined();
    });

    it('check if the dialog data was passed down', () => {
        const dialogData: DialogData = {
            title: 'Berta',
            subtitle: 'Josef',
        };

        service.confirm(dialogData);
        const args = mockDialog.open.mock.calls[0][1];
        const data = args.data;

        expect(data.title).toBe(dialogData.title);
        expect(data.subtitle).toBe(dialogData.subtitle);
    });

    it('check if the returned observable is related to the subject', (done) => {
        const observable = service.confirm();
        const args = mockDialog.open.mock.calls[0][1];
        const subject = args.data.subject;

        observable.subscribe((value) => {
            expect(value).toBe(false);
            done();
        });

        subject.next(false);
    });

    it('should check the openDialog method', () => {
        const component = null;
        const options = { test: 1 };
        service.openDialog(component, options);

        expect(mockDialog.open).toHaveBeenCalledWith(null, {
            minWidth: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: noopScrollStrategy,
            ...options,
        });
    });

    it('should check the closeAll method', () => {
        service.closeAll();

        expect(mockDialog.closeAll).toHaveBeenCalled();
    });

    it('the openMultipleChoiceDialog return should open a dialog', () => {
        service.openMultipleChoiceDialog(multipleChoiceDialogData);

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockDialog.open).toHaveBeenCalledWith(MultipleChoiceDialogComponent, {
            width: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: noopScrollStrategy,
            disableClose: true,
            data: expect.any(Object),
        });
    });

    it('check if the subject was passed down in openMultipleChoiceDialog', () => {
        service.openMultipleChoiceDialog(multipleChoiceDialogData);
        const args = mockDialog.open.mock.calls[0][1];
        const subject = args.data.subject;

        expect(subject).toBeDefined();
        expect(subject.next).toBeDefined();
    });

    it('check if the MultipleChoiceDialog data was passed down', () => {
        service.confirm(multipleChoiceDialogData);
        const args = mockDialog.open.mock.calls[0][1];
        const data = args.data;

        expect(data.title).toBe(multipleChoiceDialogData.title);
        expect(data.subtitle).toBe(multipleChoiceDialogData.subtitle);
    });

    it('check if the returned observable is related to the subject for MultipleChoiceDialog', (done) => {
        const observable = service.openMultipleChoiceDialog(multipleChoiceDialogData);
        const args = mockDialog.open.mock.calls[0][1];
        const subject = args.data.subject;

        observable.subscribe((value) => {
            expect(value.choice).toBe(fakeType.WITH_SAVE);
            done();
        });

        subject.next({ dialogRef: multipleChoiceDialogRef, choice: fakeType.WITH_SAVE });
    });
});
