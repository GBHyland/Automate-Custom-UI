/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartProcessComponent } from './start-process.component';
import { NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormCloudService, ProcessDefinitionCloud, StartProcessCloudService } from '@alfresco/adf-process-services-cloud';
import { StartProcessService } from '../../services/start-process.service';
import { delay, takeUntil } from 'rxjs/operators';
import { processCreationSuccess } from '../../../../store/actions/process-instance-cloud.action';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectApplicationName } from '../../../../store/selectors/extension.selectors';
import { STORE_ACTIONS_PROVIDER } from '../../../../services/process-services-cloud-extension-actions.provider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { startFormCompletedRedirection } from '../../../../store/actions/task-details.actions';
import { FeaturesServiceToken, IFeaturesService, provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

const selectedNodesMock = [
    {
        id: 'mockId',
        isFile: true,
        isFolder: false,
        name: 'file',
        nodeType: 'node',
        modifiedAt: new Date(),
        modifiedByUser: {
            displayName: 'root',
            id: 'root',
        },
        createdAt: new Date(),
        createdByUser: {
            displayName: 'root',
            id: 'root',
        },
    },
    {
        id: 'mockId2',
        isFile: true,
        isFolder: false,
        name: 'file-2',
        nodeType: 'node',
        modifiedAt: new Date(),
        modifiedByUser: {
            displayName: 'root',
            id: 'root',
        },
        createdAt: new Date(),
        createdByUser: {
            displayName: 'root',
            id: 'root',
        },
    },
];

export const mockQueryParams = {
    appName: 'mockApp',
    processDefinitionName: 'mockProcess',
    formKey: 'mock-form-key',
    redirect: 'mock-redirection',
    process: 'mockProcessParameter',
};

describe('Start Process Cloud Extension', () => {
    let fixture: ComponentFixture<StartProcessComponent>;
    let component: StartProcessComponent;
    let store: MockStore<any>;
    let startProcessService: StartProcessService;
    let startProcessServiceCloud: StartProcessCloudService;
    let formCloudService: FormCloudService;
    let processDefinitions: ProcessDefinitionCloud[] = [
        new ProcessDefinitionCloud({
            appName: 'mockAppName',
            appVersion: 0,
            id: 'NewProcess:1',
            name: 'process1',
            key: 'process-12345-f992-4ee6-9742-3a04617469fe',
            formKey: 'mockFormKey',
            category: 'fakeCategory',
            description: 'fakeDesc',
        }),
    ];
    let processDefinitionName = 'defaultProcessName';
    let testEnded$: Subject<void>;
    let featureService: IFeaturesService;
    let router: Router;
    let activatedRoute: ActivatedRoute;
    let notificationService: NotificationService;

    const mockProcessInstanceCloud = {
        appName: 'mockAppName',
        id: 'id',
        name: 'defaultProcessName',
        startDate: new Date(),
        initiator: '',
        status: '',
        businessKey: '',
        lastModified: new Date(),
        parentId: '',
        processDefinitionId: '',
        processDefinitionKey: 'key',
        processDefinitionName: '',
    };
    const mockActionType = { type: 'MOCK_SET_FILE_UPLOADING_DIALOG' };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule, StartProcessComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of(mockQueryParams),
                    },
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: () => {},
                    },
                },
                {
                    provide: STORE_ACTIONS_PROVIDER,
                    useValue: {
                        getOnInitAction() {
                            return mockActionType;
                        },
                        getOnDestroyAction() {
                            return mockActionType;
                        },
                    },
                },
                provideMockStore({
                    initialState: {},
                    selectors: [{ selector: selectApplicationName, value: 'mockAppName' }],
                }),
                provideMockFeatureFlags({}),
            ],
        });

        testEnded$ = new Subject<void>();
        featureService = TestBed.inject(FeaturesServiceToken);
        spyOn(featureService, 'isOn$').and.returnValue(of(true));
        startProcessService = TestBed.inject(StartProcessService);
        startProcessServiceCloud = TestBed.inject(StartProcessCloudService);
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        activatedRoute = TestBed.inject(ActivatedRoute);
        startProcessService = TestBed.inject(StartProcessService);
        startProcessServiceCloud = TestBed.inject(StartProcessCloudService);
        formCloudService = TestBed.inject(FormCloudService);
        notificationService = TestBed.inject(NotificationService);
        fixture = TestBed.createComponent(StartProcessComponent);
        component = fixture.componentInstance;

        spyOn(startProcessService, 'getDefaultProcessName').and.returnValue(processDefinitionName);
        spyOn(startProcessServiceCloud, 'getProcessDefinitions').and.returnValue(of(processDefinitions).pipe(delay(500)));
        spyOn(startProcessServiceCloud, 'getStartEventFormStaticValuesMapping').and.returnValue(of([]));
        spyOn(startProcessService, 'getAppName').and.returnValue(of('mockAppName'));
        spyOn(formCloudService, 'getForm').and.returnValue(of({ formRepresentation: {} } as any));

        fixture.detectChanges();
        await fixture.whenStable();
    });

    afterEach(() => {
        testEnded$.next();
        testEnded$.complete();
        fixture.destroy();
    });

    it('should dispatch on process creation success', () => {
        spyOn(store, 'dispatch');
        component.onProcessCreation(mockProcessInstanceCloud);
        fixture.detectChanges();
        expect(store.dispatch).toHaveBeenCalledWith(
            processCreationSuccess({
                processName: mockProcessInstanceCloud.name,
                processDefinitionKey: mockProcessInstanceCloud.processDefinitionKey,
            })
        );
    });

    it('should show snack-bar error notification when an error is thrown while starting process', () => {
        spyOn(store, 'dispatch');
        const showErrorSpy = spyOn(notificationService, 'showError');
        const errorMessage = 'Something went wrong';
        component.onProcessCreationError({
            response: {
                body: {
                    entry: {
                        message: errorMessage,
                    },
                },
            },
        });
        fixture.detectChanges();

        expect(showErrorSpy).toHaveBeenCalledWith(errorMessage);
    });

    it('should show snack-bar error notification when an error is thrown while starting process and the message is in the sub entry', () => {
        spyOn(store, 'dispatch');
        const showErrorSpy = spyOn(notificationService, 'showError');
        const errorMessage = 'Something went wrong subEntry';
        component.onProcessCreationError({
            response: {
                body: {
                    entry: {
                        entry: {
                            message: errorMessage,
                        },
                    },
                },
            },
        });
        fixture.detectChanges();

        expect(showErrorSpy).toHaveBeenCalledWith(errorMessage);
    });

    it('should show a generic Error message when there is no error message', () => {
        spyOn(store, 'dispatch');
        const showErrorSpy = spyOn(notificationService, 'showError');
        const errorMessage = 'PROCESS_CLOUD_EXTENSION.ERROR.START_PROCESS_ERROR';
        component.onProcessCreationError({
            response: {
                body: {},
            },
        });
        fixture.detectChanges();

        expect(showErrorSpy).toHaveBeenCalledWith(errorMessage);
    });

    describe('getMessageFromEvent', () => {
        it('should return validation error messages when body contains message and errors array', () => {
            const body = {
                message: 'The form contains validation errors.',
                messageKey: 'form-validation-errors',
                errors: [
                    {
                        message: "Visible and required field 'Text0b3irq' must have a value.",
                        messageKey: 'visible-and-required-value',
                        fieldId: 'Text0b3irq',
                    },
                    {
                        message: 'Another validation error',
                        messageKey: 'another-error',
                        fieldId: 'AnotherField',
                    },
                ],
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe("Visible and required field 'Text0b3irq' must have a value. || Another validation error");
        });

        it('should return validation error message when body contains single error in errors array', () => {
            const body = {
                message: 'The form contains validation errors.',
                errors: [
                    {
                        message: "Required field 'name' is missing.",
                        fieldId: 'name',
                    },
                ],
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe("Required field 'name' is missing.");
        });

        it('should return direct message when body contains message but no errors array', () => {
            const body = {
                message: 'Direct error message',
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('Direct error message');
        });

        it('should return entry message when body contains entry.message', () => {
            const body = {
                entry: {
                    message: 'Entry error message',
                },
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('Entry error message');
        });

        it('should return nested entry message when body contains entry.entry.message', () => {
            const body = {
                entry: {
                    entry: {
                        message: 'Nested entry error message',
                    },
                },
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('Nested entry error message');
        });

        it('should return generic error message when no message is found', () => {
            const body = {};

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('PROCESS_CLOUD_EXTENSION.ERROR.START_PROCESS_ERROR');
        });

        it('should handle empty errors array', () => {
            const body = {
                message: 'The form contains validation errors.',
                errors: [],
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('The form contains validation errors.');
        });

        it('should handle errors array that is not an array', () => {
            const body = {
                message: 'The form contains validation errors.',
                errors: 'not an array',
            };

            const result = component.getMessageFromEvent(body);

            expect(result).toBe('The form contains validation errors.');
        });
    });

    it('should dispatch redirection action after starting a process', () => {
        spyOn(store, 'dispatch');
        component.onProcessCreation(mockProcessInstanceCloud);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(
            startFormCompletedRedirection({
                appName: 'mockAppName',
                processDefinitionName: mockQueryParams.process,
                redirectParameter: mockQueryParams.redirect,
            })
        );
    });

    describe('For attach file widgets in the form', () => {
        beforeEach(() => {
            processDefinitions = [
                {
                    id: '',
                    appName: 'mockApp',
                    key: '',
                    formKey: 'mockForm',
                    appVersion: null,
                    version: null,
                    name: '',
                    category: '',
                    description: '',
                },
            ];
            processDefinitionName = 'mock-name';
        });

        describe('When 1 file is selected', () => {
            it('Should show warning notification in case start form does not have any upload widgets', async () => {
                spyOn(store, 'dispatch');
                spyOn(startProcessService, 'getFormById').and.returnValue(of({}));
                const showWarningSpy = spyOn(notificationService, 'showWarning');

                await startProcessService.getContentUploadWidgets('mock-process-def-id').toPromise();
                component.mapSelectedFilesFormKey('mock-formkey');

                expect(showWarningSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.ERROR.NO_FORM');
            });

            it('only the very first simple widget should be set', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('only the very first simple widget should be set (even if it was preceded by a multiple file widget)', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile2');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('should route params when process definition changes', () => {
                const navigateSpy = spyOn(router, 'navigate');
                component.onProcessDefinitionSelection(processDefinitions[0]);

                expect(navigateSpy).toHaveBeenCalledWith(['.'], {
                    queryParams: {
                        process: processDefinitions[0].name,
                    },
                    relativeTo: activatedRoute,
                    queryParamsHandling: 'merge',
                    replaceUrl: true,
                });
            });

            it('only the very first multiple widget should be set if there is no simple widget', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes([selectedNodesMock[0]]);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toEqual([selectedNodesMock[0]]);
                    done();
                });
                component.onProcessDefinitionSelection(processDefinitions[0]);
            });
        });

        describe('When multiple files are selected', () => {
            it('only the very first multiple widget should be set', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'multiple',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile1');
                    expect(formValues[0].value).toBe(selectedNodesMock);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('only the very first multiple widget should be set (even if it was preceded by a single file widget)', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                        {
                            id: 'AttachFile2',
                            type: 'multiple',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(1);
                    expect(formValues[0].name).toBe('AttachFile2');
                    expect(formValues[0].value).toEqual(selectedNodesMock);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });

            it('no single file widget should be set if there is no multiple widget', (done) => {
                spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
                    of([
                        {
                            id: 'AttachFile1',
                            type: 'single',
                        },
                    ])
                );
                startProcessService.setSelectedNodes(selectedNodesMock);

                component.formValues$.pipe(takeUntil(testEnded$)).subscribe((formValues) => {
                    expect(formValues.length).toBe(0);
                    done();
                });

                component.onProcessDefinitionSelection(processDefinitions[0]);
            });
        });
    });

    it('Should be able to call getContentUploadWidgets if selected nodes are available', (done) => {
        const getContentUploadWidgetsSpy = spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
            of([
                {
                    id: 'AttachFile1',
                    type: 'multiple',
                },
            ])
        );
        startProcessService.setSelectedNodes(selectedNodesMock);

        component.formValues$.pipe(takeUntil(testEnded$)).subscribe(() => {
            expect(getContentUploadWidgetsSpy).toHaveBeenCalledWith(processDefinitions[0].formKey);
            done();
        });

        component.onProcessDefinitionSelection(processDefinitions[0]);
    });

    it('Should not be able to call getContentUploadWidgets if there are no selected nodes', () => {
        const getContentUploadWidgetsSpy = spyOn(startProcessService, 'getContentUploadWidgets').and.returnValue(
            of([
                {
                    id: 'AttachFile1',
                    type: 'multiple',
                },
            ])
        );
        startProcessService.setSelectedNodes([]);
        component.onProcessDefinitionSelection(processDefinitions[0]);

        expect(getContentUploadWidgetsSpy).not.toHaveBeenCalled();
    });

    it('should dispatch an action when the component gets initialized', () => {
        const actionDispatchSpy = spyOn(store, 'dispatch');
        component.ngOnInit();

        expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
    });

    it('should dispatch an action the component gets destroyed', () => {
        const actionDispatchSpy = spyOn(store, 'dispatch');

        component.ngOnInit();
        fixture.destroy();

        expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
    });
});
