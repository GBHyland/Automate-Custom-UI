/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { ProcessManagementFilterEffects } from './process-management-filter.effects';
import { setProcessManagementFilter, navigateToTasks, navigateToProcesses, navigateToFilter } from '../actions/process-management-filter.actions';
import { FilterType } from '../states/extension.state';
import { selectProcessManagementFilterType } from '../selectors/extension.selectors';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('ProcessManagementEffects', () => {
    let actions$: Observable<any>;
    let effects: ProcessManagementFilterEffects;
    let router: Router;
    let store: Store<any>;
    const selectFilterType$ = new BehaviorSubject<FilterType>(FilterType.TASK);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule, NoopTranslateModule],
            providers: [
                ProcessManagementFilterEffects,
                provideMockActions(() => actions$),
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectProcessManagementFilterType) {
                                return selectFilterType$;
                            }
                            return of({});
                        },
                        dispatch: () => {},
                    },
                },
            ],
        });

        effects = TestBed.inject(ProcessManagementFilterEffects);
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
    });

    it('should navigate to task list page on navigateToTask effect', () => {
        spyOn(router, 'navigate').and.stub();
        const params = {
            queryParams: {
                filterId: 'filterId',
            },
        };
        actions$ = of(navigateToTasks(params.queryParams));

        effects.navigateToTasks$.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/task-list-cloud'], params);
    });

    it('should navigate to process list page on navigateToProcess effect', () => {
        spyOn(router, 'navigate').and.stub();
        const params = {
            queryParams: {
                filterId: 'filterId',
            },
        };
        actions$ = of(navigateToProcesses(params.queryParams));

        effects.navigateToProcesses$.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/process-list-cloud'], params);
    });

    it('should navigate to process list page on navigateToFilter effect when the types is process', () => {
        spyOn(router, 'navigate').and.stub();
        const params = {
            queryParams: {
                filterId: 'filterId',
            },
        };
        selectFilterType$.next(FilterType.PROCESS);
        actions$ = of(navigateToFilter(params.queryParams));

        effects.navigateToProcessManagementFilter$.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/process-list-cloud'], params);
    });

    it('should navigate to task list page on navigateToFilter effect when the types is task', () => {
        spyOn(router, 'navigate').and.stub();
        const params = {
            queryParams: {
                filterId: 'filterId',
            },
        };
        selectFilterType$.next(FilterType.TASK);
        actions$ = of(navigateToFilter(params.queryParams));

        effects.navigateToProcessManagementFilter$.subscribe(() => {});
        expect(router.navigate).toHaveBeenCalledWith(['/task-list-cloud'], params);
    });

    it('should reset current filter when navigating to other menus', () => {
        const resetSpy = spyOn(store, 'dispatch');
        const routerNavigatedAction = {
            type: ROUTER_NAVIGATED,
            payload: {
                routerState: {
                    url: '/mock-menu',
                },
            },
        };

        actions$ = of(routerNavigatedAction);

        const expected = setProcessManagementFilter({
            payload: {
                type: null,
                filter: undefined,
            },
        });
        effects.resetProcessManagementFilter$.subscribe(() => {});
        expect(resetSpy).toHaveBeenCalledWith(expected);
    });
});
