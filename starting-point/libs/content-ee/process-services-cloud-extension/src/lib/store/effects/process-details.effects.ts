/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { ProcessCloudService } from '@alfresco/adf-process-services-cloud';
import { openProcessCancelConfirmationDialog, cancelRunningProcess } from '../actions/process-details.actions';
import { DialogService } from '../../services/dialog.service';
import { NotificationService } from '@alfresco/adf-core';

@Injectable()
export class ProcessDetailsEffects {
    openConfirmationDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openProcessCancelConfirmationDialog),
                tap((settings) => this.openConfirmationDialog(settings))
            ),
        { dispatch: false }
    );

    cancelRunningProcess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(cancelRunningProcess),
                switchMap((payload) =>
                    this.processCloudService.cancelProcess(payload.appName, payload.processInstanceId).pipe(
                        map(() => {
                            this.location.back();
                            this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.CANCEL_MESSAGE');
                        }),
                        catchError(() => of(this.notificationService.showError('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.CANCEL_ERROR_MESSAGE')))
                    )
                )
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<any>,
        private readonly processCloudService: ProcessCloudService,
        private readonly location: Location,
        private readonly dialogService: DialogService,
        private readonly notificationService: NotificationService
    ) {}

    private openConfirmationDialog(payload: { appName: string; processInstanceId: string }) {
        this.dialogService
            .openConfirmDialogBeforeProcessCancelling()
            .afterClosed()
            .subscribe((result: boolean) => {
                if (result) {
                    this.store.dispatch(cancelRunningProcess({ appName: payload.appName, processInstanceId: payload.processInstanceId }));
                }
            });
    }
}
