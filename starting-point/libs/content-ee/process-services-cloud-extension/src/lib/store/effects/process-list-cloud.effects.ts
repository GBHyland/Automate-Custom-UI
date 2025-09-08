/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';
import { navigateToProcessDetails } from '../actions/process-list-cloud.actions';

@Injectable()
export class ProcessListCloudEffects {
    navigateToProcessDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToProcessDetails),
                tap((action) => {
                    const queryParams: NavigationExtras = {
                        queryParams: {
                            processInstanceId: action.processInstanceId,
                        },
                    };
                    void this.router.navigate(['/process-details-cloud'], queryParams);
                })
            ),
        { dispatch: false }
    );

    constructor(private actions$: Actions, private router: Router) {}
}
