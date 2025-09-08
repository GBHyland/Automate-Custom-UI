/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { StartProcessEffects } from './start-process.effects';
import { startProcess } from '../actions/start-process.actions';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StartProcessService } from '../services/start-process.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('Start Process Effect', () => {
    let effects: StartProcessEffects;
    let actions$: Observable<Action>;
    let router: Router;
    let startProcessService: StartProcessService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [
                StartProcessEffects,
                provideMockActions(() => actions$),
                {
                    provide: MatDialog,
                    useValue: {
                        open() {
                            return {
                                afterClosed(): Observable<any> {
                                    return of('process-name');
                                },
                            };
                        },
                    },
                },
            ],
        });

        router = TestBed.inject(Router);
        effects = TestBed.inject(StartProcessEffects);
        startProcessService = TestBed.inject(StartProcessService);
        spyOn(router, 'navigate');
    });

    it('Should navigate to start process page with empty processDefinition', (done) => {
        spyOn(router, 'navigateByUrl').and.resolveTo();
        actions$ = of(startProcess({ payload: [] }));

        const expectedQueryParams = {
            queryParams: {
                process: 'process-name',
            },
        };

        effects.startProcessEffect.subscribe(() => {
            setTimeout(() => {
                expect(router.navigate).toHaveBeenCalledWith(['/start-process-cloud'], expectedQueryParams);

                done();
            });
        });
    });

    it('Should not clear selected node if we are on the start process page', (done) => {
        const setSelectedNodesSpy = spyOn(startProcessService, 'setSelectedNodes');
        spyOnProperty(router, 'url', 'get').and.returnValue('/start-process-cloud?params');

        actions$ = of(startProcess({ payload: [] }));

        effects.startProcessEffect.subscribe(() => {
            setTimeout(() => {
                expect(setSelectedNodesSpy).not.toHaveBeenCalled();
                done();
            });
        });
    });

    it('Should select node', (done) => {
        const setSelectedNodesSpy = spyOn(startProcessService, 'setSelectedNodes');

        actions$ = of(startProcess({ payload: [] }));

        effects.startProcessEffect.subscribe(() => {
            setTimeout(() => {
                expect(setSelectedNodesSpy).toHaveBeenCalled();
                done();
            });
        });
    });
});
