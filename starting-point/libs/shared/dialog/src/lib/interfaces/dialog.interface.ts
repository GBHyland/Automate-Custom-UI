/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ErrorLogGroup } from '@alfresco-dbp/shared-core';
import { ThemePalette } from '@angular/material/core';
import { Subject } from 'rxjs';

export interface ActionButton {
    label: string;
    theme?: ThemePalette;
}

export interface DialogData {
    title?: string;
    subtitle?: string;
    subject?: Subject<boolean>;
    message?: string;
    messages?: string[];
    messageGroups?: ErrorLogGroup[];
    isValidationErrors?: boolean;
    htmlContent?: string;
    actionType?: string;
    modelType?: string;
}

export interface HumanReadableChoice<T> {
    choice: T;
    title?: string;
    subtitle?: string;
    color?: 'primary' | 'accent' | 'default';
    spinnable?: boolean;
}
export interface MultipleChoiceDialogData<T> extends DialogData {
    choices: HumanReadableChoice<T>[];
}

export interface ConfirmDialogData extends DialogData {
    confirmButton?: Partial<ActionButton>;
    cancelButton?: Partial<ActionButton>;
}
