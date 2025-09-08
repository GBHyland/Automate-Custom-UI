/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService, NoopTranslateModule } from '@alfresco/adf-core';
import { PublicFormContainerService } from './public-form-container.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('PublicFormContainerService', () => {
    let service: PublicFormContainerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, HttpClientTestingModule],
            providers: [
                PublicFormContainerService,
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
            ],
        }).compileComponents();

        service = TestBed.inject(PublicFormContainerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call endpoint with correct URL', () => {
        const processKey = 'testProcessKey';
        const expectedUrl = `https://mock-hyland.com/mock-appName/rb/v1/public/processes/latest?processDefinitionKey=${processKey}`;

        service.fetchLatestProcessDefinition(processKey).subscribe((response) => {
            expect(response).toEqual({ id: 'testProcessDefinitionId' });
        });

        const applicationReq = httpMock.expectOne(expectedUrl);

        expect(applicationReq.request.method).toBe('GET');

        applicationReq.flush({ id: 'testProcessDefinitionId' });
    });
});
