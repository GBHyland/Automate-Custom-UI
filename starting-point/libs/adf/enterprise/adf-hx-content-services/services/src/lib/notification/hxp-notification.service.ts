/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NotificationService, SnackBarData } from '@alfresco/adf-core';
import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';
import { Injectable } from '@angular/core';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { INotificationService } from './notification.model';

@Injectable({
    providedIn: 'root',
})
export class HxpNotificationService implements INotificationService {
    constructor(private notificationService: NotificationService) {}

    showInfo(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any) {
        this.openSnackBar(message, 'info', config, interpolateArgs);
    }

    showSuccess(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any) {
        this.openSnackBar(message, 'done', config, interpolateArgs);
    }

    showError(message: string, config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>, interpolateArgs?: any) {
        this.openSnackBar(message, 'error', config, interpolateArgs);
    }

    openSnackBar(
        message: string,
        decorativeIcon: DefaultStatusSnackBarIcon | string = 'info',
        config?: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>>,
        interpolateArgs?: any
    ) {
        const configWithIcon: MatSnackBarConfig<Omit<SnackBarData, 'actionLabel' | 'message'>> = {
            ...config,
            data: { ...config?.data, decorativeIcon },
        };

        configWithIcon.panelClass = ['hxp-snack-bar-container', 'hxp-snack-bar-type-' + decorativeIcon];

        this.notificationService.openSnackMessage(message, configWithIcon, interpolateArgs);
    }
}
