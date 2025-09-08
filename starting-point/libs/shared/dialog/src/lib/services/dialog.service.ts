/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmDialogData, DialogData, MultipleChoiceDialogData } from '../interfaces/dialog.interface';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MultipleChoiceDialogComponent, MultipleChoiceDialogReturnType } from '../components/multiple-choice-dialog/multiple-choice-dialog.component';
import { ComponentType } from '@angular/cdk/portal';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';

export const DEFAULT_DIALOG_WIDTH = '464px';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog, private readonly scrollStrategyOptions: ScrollStrategyOptions) {}

    openDialog<T>(dialog: ComponentType<T> | TemplateRef<T>, options = {}): MatDialogRef<T> {
        return this.dialog.open(dialog, {
            minWidth: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: this.scrollStrategyOptions.noop(),
            ...options,
        });
    }

    closeAll(): void {
        this.dialog.closeAll();
    }

    info(dialogData?: DialogData, options = {}): Observable<any> {
        return this.openObservableDialog(InfoDialogComponent, { disableClose: true, ...options }, dialogData);
    }

    confirm(dialogData?: ConfirmDialogData, options = {}): Observable<boolean> {
        return this.openObservableDialog(ConfirmationDialogComponent, { disableClose: true, ...options }, dialogData);
    }

    private openObservableDialog(dialog: ComponentType<unknown>, options: Partial<MatDialogConfig> = {}, data: DialogData = {}): Observable<any> {
        const dialogSubject = new Subject<any>();

        this.dialog.open(dialog, {
            width: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: this.scrollStrategyOptions.noop(),
            ...options,
            data: {
                ...data,
                subject: dialogSubject,
            },
        });

        return dialogSubject.asObservable();
    }

    openMultipleChoiceDialog<T>(dialogData: MultipleChoiceDialogData<T>): Observable<MultipleChoiceDialogReturnType<T>> {
        const subjectMultipleChoice = new Subject<MultipleChoiceDialogReturnType<T>>();

        this.dialog.open(MultipleChoiceDialogComponent, {
            width: DEFAULT_DIALOG_WIDTH,
            restoreFocus: false,
            scrollStrategy: this.scrollStrategyOptions.noop(),
            disableClose: true,
            data: {
                ...dialogData,
                subject: subjectMultipleChoice,
            },
        });

        return subjectMultipleChoice.asObservable();
    }
}
