/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { navigateToTaskDetails } from '../actions/task-list-cloud.actions';

@Injectable()
export class TaskListCloudEffects {
    navigateToTaskDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToTaskDetails),
                filter((action) => !!action.taskId),
                tap((action) => {
                    const processName = action.processName ? `/${action.processName}` : '';
                    void this.router.navigateByUrl(`/task-details-cloud/${action.taskId}${processName}`);
                })
            ),
        { dispatch: false }
    );

    constructor(private actions$: Actions, private router: Router) {}
}
