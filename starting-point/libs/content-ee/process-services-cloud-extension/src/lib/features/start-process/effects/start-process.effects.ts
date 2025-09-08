/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StartProcessService } from '../services/start-process.service';
import { NodeEntry } from '@alfresco/js-api';
import { startProcess } from '../actions/start-process.actions';
import { StartProcessDialogComponent } from '../components/start-process-dialog/start-process-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class StartProcessEffects {
    startProcessEffect = createEffect(
        () =>
            this.actions$.pipe(
                ofType(startProcess),
                tap((action) => {
                    this.openStartProcessDialog()
                        .afterClosed()
                        .subscribe(async (selectedProcessName) => {
                            if (selectedProcessName) {
                                if (this.router.url.split('?')[0] === '/start-process-cloud') {
                                    await this.router.navigateByUrl('/', { skipLocationChange: true });
                                } else {
                                    this.setSelectedNodes(action.payload);
                                }

                                void this.router.navigate(['/start-process-cloud'], {
                                    queryParams: { process: selectedProcessName },
                                });
                            }
                            this.focusAfterClose(action.configuration?.focusedElementOnCloseSelector);
                        });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private dialog: MatDialog,
        private actions$: Actions,
        private router: Router,
        private startProcessServiceCloud: StartProcessService
    ) {}

    private setSelectedNodes(nodes: NodeEntry[] = []) {
        const selectedNodes = nodes.length > 0 ? nodes.map((node) => node.entry) : [];
        this.startProcessServiceCloud.setSelectedNodes(selectedNodes);
    }

    private openStartProcessDialog() {
        return this.dialog.open(StartProcessDialogComponent, {
            width: '70%',
            height: '70%',
            panelClass: 'apa-start-process-dialog-container',
        });
    }

    private focusAfterClose(focusedElementSelector: string): void {
        if (focusedElementSelector) {
            document.querySelector<HTMLElement>(focusedElementSelector)?.focus();
        }
    }
}
