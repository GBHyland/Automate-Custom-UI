/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AppConfigService, IdentityUserService } from '@alfresco/adf-core';
import { FormCloudService, TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { of } from 'rxjs';
import { IdpConfigurationResponse } from '../../models/api-models/api-idp-configuration';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { ProcessTaskBackendService } from './process-task-backend.service';

describe('ProcessTaskBackendService', () => {
    let service: ProcessTaskBackendService;
    let formCloudService: FormCloudService;
    let taskCloudService: TaskCloudService;
    let identityUserService: any;
    let requestSpy: jasmine.Spy;
    const mockAppName = 'test-app';
    const mockBpmHost = 'http://bpmHost';

    const mockAppConfigService = {
        get: jasmine.createSpy().and.callFake((key) => {
            switch (key) {
                case 'bpmHost': {
                    return mockBpmHost;
                }
                default: {
                    return;
                }
            }
        }),
    };
    const mockAdfHttpClient = {
        request: jasmine.createSpy(),
    };

    beforeEach(() => {
        const mockTaskCloudService = {
            getTaskById: jasmine.createSpy('getTaskById').and.returnValue(of({})),
            claimTask: jasmine.createSpy('claimTask').and.returnValue(of({})),
            unclaimTask: jasmine.createSpy('unclaimTask').and.returnValue(of({})),
            canClaimTask: jasmine.createSpy('canClaimTask').and.returnValue(false),
            canUnclaimTask: jasmine.createSpy('canUnclaimTask').and.returnValue(true),
        };

        const mockIdentityUserService = {
            getCurrentUserInfo: jasmine.createSpy('getCurrentUserInfo').and.returnValue({ username: 'user' }),
        };

        TestBed.configureTestingModule({
            providers: [
                ProcessTaskBackendService,
                { provide: TaskCloudService, useValue: mockTaskCloudService },
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: AdfHttpClient, useValue: mockAdfHttpClient },
                { provide: IdentityUserService, useValue: mockIdentityUserService },
            ],
        });

        service = TestBed.inject(ProcessTaskBackendService);
        formCloudService = TestBed.inject(FormCloudService);
        taskCloudService = TestBed.inject(TaskCloudService);
        identityUserService = TestBed.inject(IdentityUserService);
        requestSpy = TestBed.inject(AdfHttpClient).request as jasmine.Spy;
        requestSpy.calls.reset();
    });

    it('should get task input data when simple key-value pair', fakeAsync(() => {
        const mockTaskId = 'test-task-id';
        const mockTaskVariables = [
            { name: 'test-variable-1', value: 'test-value-1' },
            { name: 'test-variable-2', value: 'test-value-2' },
        ];
        const expectedOutput = {
            'test-variable-1': 'test-value-1',
            'test-variable-2': 'test-value-2',
        };

        spyOn(formCloudService, 'getTaskVariables').and.returnValue(of(mockTaskVariables));

        let result;
        service.getTaskInputData$(mockAppName, mockTaskId).subscribe((data) => {
            result = data;
        });

        tick(10);
        expect(formCloudService.getTaskVariables).toHaveBeenCalledWith(mockAppName, mockTaskId);
        expect(result).toEqual(expectedOutput);
    }));

    it('should get task input data when complex variables and mixed case variable keys', fakeAsync(() => {
        const mockTaskId = 'test-task-id';
        const variable1 = {
            documents: [
                {
                    name: 'test-document-1',
                    value: 'test-value-1',
                },
                {
                    name: 'test-document-2',
                    value: 'test-value-2',
                },
            ],
            status: 'test-status-1',
        };
        const mockTaskVariables = [
            { name: 'test-variable-1', value: variable1 },
            { name: 'TestVariable2', value: 'test-value-2' },
        ];
        const expectedOutput = {
            'test-variable-1': variable1,
            testVariable2: 'test-value-2',
        };

        spyOn(formCloudService, 'getTaskVariables').and.returnValue(of(mockTaskVariables));

        let result;
        service.getTaskInputData$(mockAppName, mockTaskId).subscribe((data) => {
            result = data;
        });

        tick(10);
        expect(formCloudService.getTaskVariables).toHaveBeenCalledWith(mockAppName, mockTaskId);
        expect(result).toEqual(expectedOutput);
    }));

    it('should get IDP configuration', fakeAsync(() => {
        const mockConfiguration = {
            classification: {
                classificationConfidenceThreshold: 0.5,
                documentClassDefinitions: [],
            },
            extraction: {
                fieldDefinitionsByClass: [],
            },
        };
        const mockResponse: Partial<IdpConfigurationResponse> = {
            configuration: mockConfiguration,
        };

        requestSpy.and.returnValue(of(mockResponse));

        let result;
        service.getIdpConfiguration$(mockAppName).subscribe((config) => {
            result = config;
        });

        tick(10);
        expect(requestSpy).toHaveBeenCalledWith(`${mockBpmHost}/${mockAppName}/rb/v1/configurations/idp`, jasmine.any(Object));
        expect(result).toEqual(mockConfiguration);
    }));

    it('should complete task with true response when successful', fakeAsync(() => {
        const mockTaskId = 'test-task-id';
        const mockData = {
            'test-variable-1': 'test-value-1',
            'test-variable-2': 'test-value-2',
        };
        const mockPayload = {
            bodyParam: {
                payloadType: 'CompleteTaskPayload',
                taskId: mockTaskId,
                variables: mockData,
            },
        };

        requestSpy.and.returnValue(of({}));

        let result;
        service.completeTask$(mockAppName, mockTaskId, mockData).subscribe((response) => {
            result = response;
        });

        tick(10);
        expect(requestSpy).toHaveBeenCalledWith(
            `${mockBpmHost}/${mockAppName}/rb/v1/tasks/${mockTaskId}/complete`,
            jasmine.objectContaining(mockPayload)
        );
        expect(result).toEqual(true);
    }));

    it('should save task data with true response when successful', fakeAsync(() => {
        const mockTaskId = 'test-task-id';
        const mockData = {
            'test-variable-1': 'test-value-1',
            'test-variable-2': 'test-value-2',
        };
        const mockPayload = {
            bodyParam: {
                payloadType: 'SaveTaskPayload',
                taskId: mockTaskId,
                variables: mockData,
            },
        };

        requestSpy.and.returnValue(of({}));

        let result;
        service.saveTaskData$(mockAppName, mockTaskId, mockData).subscribe((response) => {
            result = response;
        });

        tick(10);
        expect(requestSpy).toHaveBeenCalledWith(
            `${mockBpmHost}/${mockAppName}/rb/v1/tasks/${mockTaskId}/save`,
            jasmine.objectContaining(mockPayload)
        );
        expect(result).toEqual(true);
    }));

    it('should claim task and return true', fakeAsync(() => {
        const mockTaskId = 'test-task-id';

        let result;
        service.claimTask$(mockAppName, mockTaskId).subscribe((response) => {
            result = response;
        });

        flush();

        expect(taskCloudService.claimTask).toHaveBeenCalledWith(mockAppName, mockTaskId, 'user');
        expect(result).toEqual(true);
    }));

    it('should return false from claim task when app name, task id or current user username is empty', fakeAsync(() => {
        const cases = [
            { appName: '', taskId: 'test-task-id', username: 'user' },
            { appName: 'test-app', taskId: '', username: 'user' },
            { appName: '', taskId: '', username: 'user' },
            { appName: 'test-app', taskId: 'test-task-id', username: '' },
        ];

        const ogConsoleError = console.error;
        console.error = () => {};

        for (const { appName, taskId, username } of cases) {
            identityUserService.getCurrentUserInfo.and.returnValue({ username });

            let result;
            service.claimTask$(appName, taskId).subscribe((response) => {
                result = response;
            });

            flush();

            expect(taskCloudService.claimTask).not.toHaveBeenCalled();
            expect(result).toEqual(false);
        }

        console.error = ogConsoleError;
    }));

    it('should unclaim task and return true', fakeAsync(() => {
        const mockTaskId = 'test-task-id';

        let result;
        service.unclaimTask$(mockAppName, mockTaskId).subscribe((response) => {
            result = response;
        });

        flush();

        expect(taskCloudService.unclaimTask).toHaveBeenCalledWith(mockAppName, mockTaskId);
        expect(result).toEqual(true);
    }));

    it('should return false from unclaim task when app name or task id is empty', fakeAsync(() => {
        const cases = [
            { appName: '', taskId: 'test-task-id' },
            { appName: 'test-app', taskId: '' },
            { appName: '', taskId: '' },
        ];

        const ogConsoleError = console.error;
        console.error = () => {};

        for (const { appName, taskId } of cases) {
            let result;
            service.claimTask$(appName, taskId).subscribe((response) => {
                result = response;
            });

            flush();

            expect(taskCloudService.claimTask).not.toHaveBeenCalled();
            expect(result).toEqual(false);
        }

        console.error = ogConsoleError;
    }));

    it('should get task claim properties and return true', fakeAsync(() => {
        const mockTaskId = 'test-task-id';

        let result;
        service.getTaskClaimProperties$(mockAppName, mockTaskId).subscribe((response) => {
            result = response;
        });

        flush();

        expect(taskCloudService.getTaskById).toHaveBeenCalledWith(mockAppName, mockTaskId);
        expect(taskCloudService.canClaimTask).toHaveBeenCalled();
        expect(taskCloudService.canUnclaimTask).toHaveBeenCalled();
        expect(result).toEqual({ success: true, canClaimTask: false, canUnclaimTask: true });
    }));

    it('should return false from getTaskClaimProperties$ when app name or task id is empty', fakeAsync(() => {
        const cases = [
            { appName: '', taskId: 'test-task-id' },
            { appName: 'test-app', taskId: '' },
            { appName: '', taskId: '' },
        ];

        const ogConsoleError = console.error;
        console.error = () => {};

        for (const { appName, taskId } of cases) {
            let result;
            service.getTaskClaimProperties$(appName, taskId).subscribe((response) => {
                result = response;
            });

            flush();

            expect(taskCloudService.getTaskById).not.toHaveBeenCalled();
            expect(taskCloudService.canClaimTask).not.toHaveBeenCalled();
            expect(taskCloudService.canUnclaimTask).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false });
        }

        console.error = ogConsoleError;
    }));
});
