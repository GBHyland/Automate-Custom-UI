/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { hot } from 'jasmine-marbles';
import { ProcessCloudHealthEffects } from './process-cloud-health.effects';
import { initialiseExtension } from '../actions/extension.actions';
import { NotificationService, NoopTranslateModule } from '@alfresco/adf-core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProcessCloudHealthEffects', () => {
    let effects: ProcessCloudHealthEffects;
    let actions$: Observable<Action>;
    let notificationService: NotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule],
            providers: [ProcessCloudHealthEffects, provideMockActions(() => actions$)],
        });
        effects = TestBed.inject(ProcessCloudHealthEffects);
        notificationService = TestBed.inject(NotificationService);
    });

    it('Should show error notification if the health is false', async () => {
        actions$ = of(initialiseExtension({ health: false, application: '' }));
        const notificationServiceSpy = spyOn(notificationService, 'showError');

        await effects.updateHealth$.toPromise();

        expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR');
    });

    it('Should dispatch nothing if the health is true', () => {
        actions$ = hot('-a-', {
            a: initialiseExtension({ health: true, application: '' }),
        });

        const expected$ = hot('---');

        expect(effects.updateHealth$).toBeObservable(expected$);
    });
});
