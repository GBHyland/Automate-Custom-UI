/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, SecurityContext } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActionButton } from '../../interfaces/dialog.interface';
import { ErrorLogGroup } from '@alfresco-dbp/shared-core';

export type BasicModalDestructiveCommands = 'delete' | 'remove' | 'undeploy';

export interface ConfirmDialogPayload {
    subject?: Subject<boolean>;
    title?: string;
    subtitle?: string;
    htmlContent?: string;
    messages?: string[];
    message?: string;
    confirmButton?: Partial<ActionButton>;
    cancelButton?: Partial<ActionButton>;
    isValidationErrors?: boolean;
    messageGroups?: ErrorLogGroup[];
    actionType?: BasicModalDestructiveCommands;
    modelType?: string;
}

@Component({
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, NgClass, MatDialogModule, MatButtonModule, TranslatePipe],
})
export class ConfirmationDialogComponent {
    public dialog = inject(MatDialogRef<ConfirmationDialogComponent>);
    public data = inject<ConfirmDialogPayload>(MAT_DIALOG_DATA, {
        optional: true,
    });
    private sanitizer = inject(DomSanitizer);

    constructor(protected readonly translationService: TranslateService) {}

    title = this.data?.title || 'APP.DIALOGS.CONFIRM.TITLE';
    subtitle = this.data?.subtitle ?? '';
    htmlContent = this.data?.htmlContent ? this.sanitizer.sanitize(SecurityContext.HTML, this.data.htmlContent) : undefined;
    message = this.data?.message;
    messages = this.data?.messages ?? [];
    subject = this.data?.subject ?? new BehaviorSubject<boolean>(false);
    confirmButton: ActionButton = {
        label: 'APP.DIALOGS.CONFIRM.BUTTON',
        theme: 'primary',
        ...(this.data?.confirmButton ?? {}),
    };

    cancelButton: ActionButton = {
        label: 'APP.DIALOGS.CANCEL',
        ...this.data?.cancelButton,
    };

    isValidationErrors = !!this.data?.isValidationErrors;
    messageGroups = this.data?.messageGroups || [];

    choose(choice: boolean): void {
        this.subject?.next(choice);
        this.dialog.close(choice);
        this.subject?.complete();
    }

    isWarning(actionType: BasicModalDestructiveCommands | undefined): boolean {
        return actionType === 'delete' || actionType === 'remove' || actionType === 'undeploy';
    }

    getDestructiveEventType(actionType: BasicModalDestructiveCommands): string {
        let eventType = '';
        if (!actionType) {
            return eventType;
        }
        switch (actionType) {
            case 'delete': {
                eventType = 'APP.DIALOGS.DELETE';
                break;
            }
            case 'remove': {
                eventType = 'APP.DIALOGS.REMOVE';
                break;
            }
            case 'undeploy': {
                eventType = 'APP.DIALOGS.UNDEPLOY';
                break;
            }
        }
        return this.translationService.instant(eventType);
    }

    printLabel(): string {
        if (!this.data?.actionType || !this.data?.modelType) {
            return this.translationService.instant(this.confirmButton.label);
        }
        return this.isWarning(this.data.actionType)
            ? this.getDestructiveEventType(this.data.actionType) + ' ' + this.translationService.instant(this.data.modelType)
            : this.translationService.instant(this.confirmButton.label);
    }
}
