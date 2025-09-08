/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { HumanReadableChoice } from '../../interfaces/dialog.interface';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface MultipleChoiceDialogPayload<T> {
    subject: Subject<MultipleChoiceDialogReturnType<T>>;
    choices?: HumanReadableChoice<T>[];
    title?: string;
    subtitle?: string;
}

export interface MultipleChoiceDialogReturnType<T> {
    dialogRef: MatDialogRef<MultipleChoiceDialogComponent<T>>;
    choice: T;
}

@Component({
    templateUrl: './multiple-choice-dialog.component.html',
    styleUrls: ['./multiple-choice-dialog.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, MatIconModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule, TranslatePipe],
})
export class MultipleChoiceDialogComponent<T> implements OnInit {
    title!: string;
    subtitle!: string;
    subject!: Subject<MultipleChoiceDialogReturnType<T>>;
    choices!: HumanReadableChoice<T>[];
    loading: Record<string, boolean> = {};
    disableButtons = false;

    constructor(
        public dialog: MatDialogRef<MultipleChoiceDialogComponent<T>>,
        @Optional()
        @Inject(MAT_DIALOG_DATA)
        public data: MultipleChoiceDialogPayload<T>
    ) {}

    ngOnInit() {
        this.title = this.data.title ?? '';
        this.subtitle = this.data.subtitle ?? '';
        this.choices = this.data.choices ?? [];
        this.subject = this.data.subject;
    }

    choose(choice: any): void {
        this.disableButtons = true;
        this.loading[choice] = true;
        this.subject.next({ dialogRef: this.dialog, choice });
        this.subject.complete();
    }

    isSpinnerVisible(choice: any) {
        return choice.spinnable && this.loading[choice.choice];
    }
}
