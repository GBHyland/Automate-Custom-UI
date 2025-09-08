/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@alfresco/adf-core';
import { PublicFormService } from './public-form.service';
import { mockFormRepresentationWithOutcome } from './form-representation.mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { firstValueFrom, of } from 'rxjs';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { PUBLIC_PROCESS_CONFIG } from '../../tokens/process-id.token';

describe('PublicFormService', () => {
    let service: PublicFormService;
    const mockRequest = jest.fn().mockReturnValue(of(mockFormRepresentationWithOutcome));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PublicFormService,
                { provide: AdfHttpClient, useValue: { request: mockRequest } },
                {
                    provide: AppConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'bpmHost') {
                                return 'https://mock-hyland.com';
                            } else if (key === 'alfresco-deployed-apps') {
                                return [{ name: 'mock-appName' }];
                            }
                            return '';
                        },
                    },
                },
                {
                    provide: PUBLIC_PROCESS_CONFIG,
                    useValue: { id: 'testProcessId' },
                },
            ],
        });

        service = TestBed.inject(PublicFormService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call HTTP get method with right params', async () => {
        const response = await firstValueFrom(service.fetchFormRepresentation());

        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/start-form`,
            expect.anything()
        );
        expect(response).toEqual(mockFormRepresentationWithOutcome);
    });

    it('should send HTTP POST request with right params and payload', async () => {
        const fakeFormValues = { key: 'value' };

        await firstValueFrom(service.startProcess(fakeFormValues, 'outcome'));
        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/form/submit`,
            expect.objectContaining({
                bodyParam: {
                    payloadType: 'StartProcessPayload',
                    processDefinitionKey: 'testProcessId',
                    values: fakeFormValues,
                    outcome: 'outcome',
                },
            })
        );
    });

    it('should call HTTP get method to fetch static form values', async () => {
        await firstValueFrom(service.fetchStaticFormValues());

        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/static-values`,
            expect.anything()
        );
    });

    it('should call HTTP get method to fetch constant values', async () => {
        await firstValueFrom(service.fetchStartEventConstants());

        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/constant-values`,
            expect.anything()
        );
    });
});
