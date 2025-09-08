/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ClassVerificationViewerComponent } from './class-verification-viewer.component';
import { IdpDocumentService } from '../../services/document/idp-document.service';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';
import { IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { provideMockStore } from '@ngrx/store/testing';
import { classVerificationStateName, initialClassVerificationRootState } from '../../store/states/root.state';
import { documentAdapter, initialDocumentState } from '../../store/states/document.state';
import { documentClassAdapter, initialDocumentClassState } from '../../store/states/document-class.state';
import { IdpSharedImageLoadingService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpViewerEventTypes } from '@hyland/idp-document-viewer';

describe('ClassVerificationViewerComponent', () => {
    let component: ClassVerificationViewerComponent;
    let fixture: ComponentFixture<ClassVerificationViewerComponent>;
    let idpDocumentToolbarServiceMock: jasmine.SpyObj<IdpDocumentToolbarService>;
    let idpImageLoadingService: jasmine.SpyObj<IdpImageLoadingService>;
    let idpDocumentServiceMock: jasmine.SpyObj<IdpDocumentService>;

    const mockedDocuments = mockIdpDocuments();

    beforeEach(() => {
        idpDocumentToolbarServiceMock = jasmine.createSpyObj<IdpDocumentToolbarService>(
            'IdpDocumentToolbarService',
            ['handleMovePageAndCreateNewDoc', 'handlePageSplit', 'handlePageSplit', 'handleMovePages'],
            {
                documentToolBarItems$: of([]),
            }
        );

        idpDocumentServiceMock = jasmine.createSpyObj<IdpDocumentService>(
            'IdpDocumentService',
            ['toggleExpandDocument', 'getDocumentsForClass', 'togglePreviewedDocument', 'changeFullScreen', 'updatePagesRotation'],
            {
                selectedDocuments$: of(mockedDocuments),
                allDocumentsValid$: of(true),
            }
        );

        const mockState = {
            [classVerificationStateName]: {
                ...initialClassVerificationRootState,
                documents: documentAdapter.setAll([], initialDocumentState),
                documentClasses: documentClassAdapter.setAll([], initialDocumentClassState),
            },
        };

        idpImageLoadingService = jasmine.createSpyObj<IdpImageLoadingService>('IdpImageLoadingService', ['getImageDataForPage$', 'cleanup']);
        idpImageLoadingService.getImageDataForPage$.and.returnValue(of(undefined));
        idpImageLoadingService.cleanup.and.callFake(() => {});

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ClassVerificationViewerComponent],
            providers: [
                provideMockStore({
                    initialState: mockState,
                    selectors: [],
                }),
                { provide: IdpDocumentToolbarService, useValue: idpDocumentToolbarServiceMock },
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpImageLoadingService, useValue: idpImageLoadingService },
                IdpSharedImageLoadingService,
            ],
        });

        fixture = TestBed.createComponent(ClassVerificationViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call changeFullScreen with true state if full screen enter event has been fired', () => {
        const event = {
            type: IdpViewerEventTypes.FullScreenEnter,
            timestamp: '',
            data: {
                dataSourceRef: [
                    {
                        pageId: '1',
                        documentId: 'documentId',
                    },
                ],
                newValue: {
                    fullscreen: true,
                },
            },
        };
        component.onViewerEvent(event);
        expect(idpDocumentServiceMock.changeFullScreen).toHaveBeenCalledOnceWith(true);
    });

    it('should call changeFullScreen with false state if full screen enter event has been fired', () => {
        const event = {
            type: IdpViewerEventTypes.FullScreenExit,
            timestamp: '',
            data: {
                dataSourceRef: [
                    {
                        pageId: '1',
                        documentId: 'documentId',
                    },
                ],
                newValue: {
                    fullscreen: false,
                },
            },
        };
        component.onViewerEvent(event);
        expect(idpDocumentServiceMock.changeFullScreen).toHaveBeenCalledOnceWith(false);
    });

    it('should call updatePagesRotation when rotation is changed', () => {
        const event = {
            type: IdpViewerEventTypes.RotationChanged,
            timestamp: '',
            data: {
                dataSourceRef: [
                    {
                        pageId: '1',
                        documentId: 'documentId1',
                        viewerRotation: 90,
                    },
                    {
                        pageId: '2',
                        documentId: 'documentId2',
                        viewerRotation: 90,
                    },
                ],
                newValue: {
                    rotationStep: 90,
                },
            },
        };
        const expected = [
            {
                pageId: '1',
                documentId: 'documentId1',
                viewerRotation: 90,
            },
            {
                pageId: '2',
                documentId: 'documentId2',
                viewerRotation: 90,
            },
        ];
        component.onViewerEvent(event);
        expect(idpDocumentServiceMock.updatePagesRotation).toHaveBeenCalledOnceWith(expected, false);
    });
});
