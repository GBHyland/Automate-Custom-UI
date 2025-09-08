/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicFormContainerService } from './public-form-container.service';
import { PublicFormContainerComponent } from './public-form-container.component';
import { MockProvider } from 'ng-mocks';
import { PublicFormRedirectionService } from '../../services/public-form-redirection.service';

describe('PublicFormContainerComponent', () => {
    let service: PublicFormContainerService;
    let fixture: ComponentFixture<PublicFormContainerComponent>;
    describe('With processKey', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NoopTranslateModule, HttpClientTestingModule],
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            paramMap: of({
                                get: jest.fn().mockImplementation((param) => {
                                    if (param === 'processKey') {
                                        return 'testProcessKey';
                                    }
                                    return null;
                                }),
                            }),
                        },
                    },
                    PublicFormContainerService,
                    MockProvider(PublicFormRedirectionService),
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PublicFormContainerComponent);
            service = TestBed.inject(PublicFormContainerService);
            service.fetchLatestProcessDefinition = jest.fn().mockReturnValue(
                of({
                    id: 'testProcessDefinitionId',
                })
            );
            fixture.detectChanges();
        });
        it('should fetch the latest process definition when processKey is provided', () => {
            jest.spyOn(service, 'fetchLatestProcessDefinition');
            fixture.detectChanges();

            expect(service.fetchLatestProcessDefinition).toHaveBeenCalledWith('testProcessKey');
            expect(service.fetchLatestProcessDefinition).toHaveBeenCalledTimes(1);
        });

        it('should set processId when processKey is provided', () => {
            const component = fixture.componentInstance;
            expect(component.processId).toBe('testProcessDefinitionId');
        });
    });
    describe('With processId', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NoopTranslateModule, HttpClientTestingModule],
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            paramMap: of({
                                get: jest.fn().mockImplementation((param) => {
                                    if (param === 'processId') {
                                        return 'testProcessId';
                                    }
                                    return null;
                                }),
                            }),
                        },
                    },
                    PublicFormContainerService,
                    MockProvider(PublicFormRedirectionService),
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PublicFormContainerComponent);
            service = TestBed.inject(PublicFormContainerService);
            fixture.detectChanges();
        });

        it('should set processId when processId is provided', () => {
            const component = fixture.componentInstance;
            expect(component.processId).toBe('testProcessId');
        });

        it('should not call fetchLatestProcessDefinition when processId is provided', () => {
            jest.spyOn(service, 'fetchLatestProcessDefinition');

            fixture.detectChanges();

            expect(service.fetchLatestProcessDefinition).not.toHaveBeenCalled();
        });
    });
});
