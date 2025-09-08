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

import { ProcessDefinitionEffects } from './process-definition.effects';
import { cold, hot } from 'jasmine-marbles';
import { loadProcessDefinitions, loadProcessDefinitionsFailure, loadRecentProcessDefinitions } from '../actions/process-definition.actions';
import { PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { selectApplicationName } from '../selectors/extension.selectors';
import { selectProcessDefinitionEntities } from '../selectors/process-definitions.selector';
import { TRIGGERABLE_BY_FORM_CATEGORY } from '@alfresco-dbp/shared-core';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProcessDefinitionEffects', () => {
    let actions$: Observable<any>;
    let effects: ProcessDefinitionEffects;
    let startProcessCloudService: StartProcessCloudService;
    let preferencesService: any;

    /* cspell:disable */
    const processDefinitionMock = {
        appName: 'mock-appName',
        appVersion: 1,
        formKey: 'form-bf715c98-a607-4d63-b52d-700e939429aa',
        id: 'Process_66AFnDFHM:1:58b02889-9422-11ea-9f59-52b2b97fcb55',
        key: 'Process_66AFnDFHM',
        name: 'process1',
        category: 'fakeCategory',
        description: 'fakeDescription',
        serviceFullName: 'service',
        serviceName: 'sn',
        serviceType: 'bundle',
        serviceVersion: '',
        version: 1,
        loaded: true,
    };
    /* cspell:enable */

    beforeEach(() => {
        preferencesService = jasmine.createSpyObj('preferencesService', ['getPreferences']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ProcessDefinitionEffects,
                provideMockActions(() => actions$),
                {
                    provide: PROCESS_LISTS_PREFERENCES_SERVICE_TOKEN,
                    useValue: preferencesService,
                },
                provideMockStore({
                    initialState: {},
                    selectors: [
                        {
                            selector: selectProcessDefinitionEntities,
                            value: [processDefinitionMock],
                        },
                        {
                            selector: selectApplicationName,
                            value: 'mock-appName',
                        },
                    ],
                }),
                provideMockFeatureFlags({
                    [STUDIO_SHARED.STUDIO_FORM_PROCESS_VISIBILITY]: true,
                }),
            ],
        });
    });

    describe('STUDIO_FORM_PROCESS_VISIBILITY FF On', () => {
        beforeEach(() => {
            effects = TestBed.inject(ProcessDefinitionEffects);
            startProcessCloudService = TestBed.inject(StartProcessCloudService);
        });

        describe('loadProcessDefinitions', () => {
            it('should dispatch ProcessDefinitions success action on loadProcessDefinitions action', () => {
                spyOn(startProcessCloudService, 'getProcessDefinitions').and.returnValue(of([processDefinitionMock]));
                actions$ = hot('-a-', { a: loadProcessDefinitions() });

                const expected$ = hot('-b-', {
                    b: {
                        type: '[ProcessDefinition] Load ProcessDefinitions Success',
                        definitions: [processDefinitionMock],
                    },
                });
                expect(effects.loadProcessDefinitions$).toBeObservable(expected$);
            });

            it('should call the load definition service with the right appName & query params', () => {
                spyOn(startProcessCloudService, 'getProcessDefinitions').and.returnValue(of([processDefinitionMock]));
                actions$ = of({
                    type: '[ProcessDefinition] Load ProcessDefinitions',
                    name: 'Load Definition',
                });

                effects.loadProcessDefinitions$.subscribe(() => {});
                expect(startProcessCloudService.getProcessDefinitions).toHaveBeenCalledWith('mock-appName', {
                    include: 'variables',
                    excludedCategory: TRIGGERABLE_BY_FORM_CATEGORY,
                });
            });

            it('should dispatch ProcessDefinitions error action on loadProcessDefinitions action', () => {
                actions$ = hot('-a|', { a: loadProcessDefinitions() });

                const response = cold('-#|)', {}, new Error('error'));
                startProcessCloudService.getProcessDefinitions = () => response;

                const expected = cold('--(b|)', { b: loadProcessDefinitionsFailure({ error: 'error' }) });

                expect(effects.loadProcessDefinitions$).toBeObservable(expected);
            });
        });

        describe('loadRecentProcessDefinitions', () => {
            it('should dispatch setRecentProcessDefinitions action on loadRecentProcessDefinitions action', () => {
                preferencesService.getPreferences.and.returnValue(
                    of({ list: { entries: [{ entry: { key: 'recent-process-definition-ids', value: '["a","b","c"]' } }] } })
                );
                actions$ = hot('-a-', { a: loadRecentProcessDefinitions() });

                const expected$ = hot('-b-', {
                    b: {
                        type: '[ProcessDefinition] setRecentProcessDefinitions',
                        definitionKeys: ['a', 'b', 'c'],
                    },
                });
                expect(effects.loadRecentProcessDefinitions$).toBeObservable(expected$);
            });

            it('should call the get preferences service with the right appName', () => {
                preferencesService.getPreferences.and.returnValue(
                    of({ list: { entries: [{ entry: { key: 'recent-process-definition-ids', value: '["a","b","c"]' } }] } })
                );

                actions$ = of({
                    type: '[ProcessDefinition] Load Recent Process Definitions',
                    name: 'Load Recent Process Definition',
                });

                effects.loadRecentProcessDefinitions$.subscribe(() => {});
                expect(preferencesService.getPreferences).toHaveBeenCalledWith('mock-appName');
            });

            it('should return empty array when the preferences is empty array', () => {
                preferencesService.getPreferences.and.returnValue(of({ list: { entries: '[]' } }));
                actions$ = hot('a', { a: loadRecentProcessDefinitions() });

                const expected$ = cold('b', {
                    b: {
                        type: '[ProcessDefinition] setRecentProcessDefinitions',
                        definitionKeys: [],
                    },
                });
                expect(effects.loadRecentProcessDefinitions$).toBeObservable(expected$);
            });

            it('should return empty array when the preferences is not present', () => {
                preferencesService.getPreferences.and.returnValue(of({ list: { entries: undefined } }));
                actions$ = hot('a', { a: loadRecentProcessDefinitions() });

                const expected$ = cold('b', {
                    b: {
                        type: '[ProcessDefinition] setRecentProcessDefinitions',
                        definitionKeys: [],
                    },
                });
                expect(effects.loadRecentProcessDefinitions$).toBeObservable(expected$);
            });
        });
    });

    describe('STUDIO_FORM_PROCESS_VISIBILITY FF Off', () => {
        beforeEach(() => {
            const { provide, useValue } = provideMockFeatureFlags({
                [STUDIO_SHARED.STUDIO_FORM_PROCESS_VISIBILITY]: false,
            });

            TestBed.overrideProvider(provide, { useValue });

            effects = TestBed.inject(ProcessDefinitionEffects);
            startProcessCloudService = TestBed.inject(StartProcessCloudService);
        });

        it('should call the load definition service with the right appName & query params (excludedCategory param NOT included)', () => {
            spyOn(startProcessCloudService, 'getProcessDefinitions').and.returnValue(of([processDefinitionMock]));
            actions$ = of({
                type: '[ProcessDefinition] Load ProcessDefinitions',
                name: 'Load Definition',
            });

            effects.loadProcessDefinitions$.subscribe(() => {});
            expect(startProcessCloudService.getProcessDefinitions).toHaveBeenCalledWith('mock-appName', {
                include: 'variables',
            });
        });
    });
});
