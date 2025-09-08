/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { hot } from 'jasmine-marbles';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProcessDetailsEffects } from './process-details.effects';
import { openProcessCancelConfirmationDialog } from '../actions/process-details.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogService } from '../../services/dialog.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProcessDetailsEffects', () => {
    let actions$: Observable<any>;
    let effects: ProcessDetailsEffects;
    let dialogService: DialogService;
    let openConfirmDialogBeforeProcessCancellingSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatDialogModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [ProcessDetailsEffects, provideMockStore(), provideMockActions(() => actions$)],
        });

        effects = TestBed.inject(ProcessDetailsEffects);
        dialogService = TestBed.inject(DialogService);
        const dialogReturnValue: any = {
            afterClosed() {
                return of();
            },
        };
        openConfirmDialogBeforeProcessCancellingSpy = spyOn(dialogService, 'openConfirmDialogBeforeProcessCancelling').and.returnValue(
            dialogReturnValue
        );
    });

    it('should open confirmation dialog on openConfirmationDialog action', () => {
        actions$ = hot('-a-', { a: openProcessCancelConfirmationDialog({ appName: 'mock-appName', processInstanceId: 'mock-id' }) });

        const expected$ = hot('-b-', {
            b: {
                type: '[ProcessDetails] Open Process Cancel Confirmation Dialog',
                appName: 'mock-appName',
                processInstanceId: 'mock-id',
            },
        });
        expect(effects.openConfirmationDialog$).toBeObservable(expected$);
        expect(openConfirmDialogBeforeProcessCancellingSpy).toHaveBeenCalled();
    });
});
