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
import { hot, cold } from 'jasmine-marbles';
import { PreferenceCloudServiceInterface, PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName } from '../selectors/extension.selectors';
import { selectRecentProcessDefinitionKeys } from '../selectors/process-definitions.selector';
import { ProcessInstanceEffect } from './process-cloud-instance.effect';
import { provideMockStore } from '@ngrx/store/testing';
import { processCreationSuccess } from '../actions/process-instance-cloud.action';
import { setRecentProcessDefinitions } from '../actions/process-definition.actions';
import { NotificationService, NoopTranslateModule } from '@alfresco/adf-core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const processCreationSuccessAction = () =>
    processCreationSuccess({
        processDefinitionKey: 'new_definition',
        processName: 'name',
    });

const setRecentProcessDefinitionsAction = () =>
    setRecentProcessDefinitions({
        definitionKeys: ['new_definition', 'recentKey1', 'recentKey2'],
    });

describe('ProcessInstanceEffect', () => {
    let actions$: Observable<any>;
    let effect: ProcessInstanceEffect;
    let preferencesService: PreferenceCloudServiceInterface;
    let notificationService: NotificationService;

    beforeEach(() => {
        preferencesService = jasmine.createSpyObj<PreferenceCloudServiceInterface>('preferencesService', ['updatePreference']);

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule],
            providers: [
                ProcessInstanceEffect,
                {
                    provide: PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN,
                    useValue: preferencesService,
                },
                provideMockActions(() => actions$),
                provideMockStore({
                    selectors: [
                        {
                            selector: selectRecentProcessDefinitionKeys,
                            value: ['recentKey1', 'recentKey2', 'recentKey3'],
                        },
                        {
                            selector: selectApplicationName,
                            value: 'appName',
                        },
                    ],
                }),
            ],
        });

        effect = TestBed.inject(ProcessInstanceEffect);
        notificationService = TestBed.inject(NotificationService);
    });

    it('should dispatch new recent definition list on creating process success', () => {
        actions$ = cold('-a-', { a: processCreationSuccessAction() });
        const expected$ = hot('-b-', { b: setRecentProcessDefinitionsAction() });

        expect(effect.processCreationSuccess$).toBeObservable(expected$);
    });

    it('should save recent processes using preferences service', () => {
        actions$ = cold('-a-', { a: processCreationSuccessAction() });

        effect.processCreationSuccess$.subscribe(() => {
            expect(preferencesService.updatePreference).toHaveBeenCalledWith('appName', 'recent-process-definition-ids', [
                'new_definition',
                'recentKey1',
                'recentKey2',
            ]);
        });
    });

    it('should show info notification on process creation success', async () => {
        actions$ = of(processCreationSuccessAction());
        const notificationServiceSpy = spyOn(notificationService, 'showInfo');

        await effect.showProcessCreationSuccessMessage$.toPromise();

        expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.SNACKBAR.PROCESS-CREATED', undefined, { processName: 'name' });
    });
});
