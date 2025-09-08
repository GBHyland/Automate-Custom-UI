/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, filter, withLatestFrom } from 'rxjs/operators';
import { setProcessManagementFilter, navigateToFilter, navigateToTasks, navigateToProcesses } from '../actions/process-management-filter.actions';
import { Router, NavigationExtras } from '@angular/router';
import { RouterNavigatedAction, ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { FilterType } from '../states/extension.state';
import { selectProcessManagementFilterType } from '../selectors/extension.selectors';

@Injectable()
export class ProcessManagementFilterEffects {
    navigateToProcessManagementFilter$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToFilter),
                filter((action) => !!action.filterId),
                withLatestFrom(this.store.select(selectProcessManagementFilterType)),
                tap(([action, type]) => {
                    const queryParams = action.queryParams || { filterId: action.filterId };

                    if (type === FilterType.TASK) {
                        void this.router.navigate(['/task-list-cloud'], { queryParams });
                    } else {
                        void this.router.navigate(['/process-list-cloud'], { queryParams });
                    }
                })
            ),
        { dispatch: false }
    );

    navigateToTasks$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToTasks),
                filter((action) => !!action.filterId),
                tap((action) => {
                    const queryParams: NavigationExtras = {
                        queryParams: {
                            filterId: action.filterId,
                        },
                    };
                    void this.router.navigate(['/task-list-cloud'], queryParams);
                })
            ),
        { dispatch: false }
    );

    navigateToProcesses$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToProcesses),
                filter((action) => !!action.filterId),
                tap((action) => {
                    const queryParams: NavigationExtras = {
                        queryParams: {
                            filterId: action.filterId,
                        },
                    };
                    void this.router.navigate(['/process-list-cloud'], queryParams);
                })
            ),
        { dispatch: false }
    );

    resetProcessManagementFilter$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType<RouterNavigatedAction>(ROUTER_NAVIGATED),
                filter(() => this.isNotProcessServicesCloudUrl(this.router.url)),
                tap(() => {
                    this.store.dispatch(
                        setProcessManagementFilter({
                            payload: {
                                type: null,
                                filter: undefined,
                            },
                        })
                    );
                })
            ),
        { dispatch: false }
    );

    constructor(private actions$: Actions, private router: Router, private store: Store<any>) {}

    private isNotProcessServicesCloudUrl(url: string): boolean {
        return !url.includes('task') && !url.includes('process');
    }
}
