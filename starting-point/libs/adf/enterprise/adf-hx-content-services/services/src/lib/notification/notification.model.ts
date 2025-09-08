/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SnackBarData } from '@alfresco/adf-core';
import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

export interface INotificationService {
    showInfo(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any): void;

    showSuccess(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any): void;

    showError(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any): void;

    openSnackBar(
        message: string,
        decorativeIcon: DefaultStatusSnackBarIcon | string,
        config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>,
        interpolateArgs?: any
    ): void;
}
