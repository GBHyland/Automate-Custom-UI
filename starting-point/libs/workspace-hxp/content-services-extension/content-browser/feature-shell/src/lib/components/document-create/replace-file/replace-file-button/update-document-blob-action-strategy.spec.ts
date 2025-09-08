/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { UpdateDocumentBlobActionStrategy } from './update-document-blob-action-strategy';
import { UploadContentModel, UploadDocumentModel } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

describe('UpdateDocumentBlobActionStrategy', () => {
    let updateDocumentBlobActionStrategy: UpdateDocumentBlobActionStrategy;
    let documentService: jasmine.SpyObj<DocumentService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('DocumentService', ['updateDocument']);

        TestBed.configureTestingModule({
            providers: [UpdateDocumentBlobActionStrategy, { provide: DocumentService, useValue: spy }],
        });

        updateDocumentBlobActionStrategy = TestBed.inject(UpdateDocumentBlobActionStrategy);
        documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    });

    it('should update document blob', (done) => {
        const mockDocument: Document = { sys_id: '123', sys_title: 'test' } as Document;
        const uploadModel: UploadContentModel = {
            documentModel: new UploadDocumentModel({
                ...mockDocument,
                sysfile_blob: { uploadId: 'abc' },
            }),
        } as UploadContentModel;

        documentService.updateDocument.and.returnValue(of(mockDocument));

        expect(documentService.updateDocument).not.toHaveBeenCalled();

        updateDocumentBlobActionStrategy.execute(uploadModel).subscribe({
            next: (document) => {
                expect(document).toEqual(mockDocument);
                expect(documentService.updateDocument).toHaveBeenCalledWith('123', {
                    sysfile_blob: { uploadId: 'abc' },
                });
                done();
            },
        });
    });
});
