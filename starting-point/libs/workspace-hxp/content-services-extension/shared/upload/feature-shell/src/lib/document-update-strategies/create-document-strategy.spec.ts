/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { CreateDocumentStrategy } from './create-document-strategy';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { UploadContentModel } from '../model/upload-content.model';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { of } from 'rxjs';

describe('CreateDocumentStrategy', () => {
    let strategy: CreateDocumentStrategy;
    let documentServiceSpy: jasmine.SpyObj<DocumentService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('DocumentService', ['createDocument']);

        TestBed.configureTestingModule({
            providers: [CreateDocumentStrategy, { provide: DocumentService, useValue: spy }],
        });

        strategy = TestBed.inject(CreateDocumentStrategy);
        documentServiceSpy = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    });

    it('should call createDocument and return the created document', (done) => {
        const mockDocument: Document = { sys_id: '123', sys_title: 'test' } as Document;
        const uploadModel: UploadContentModel = { documentModel: { document: mockDocument } } as UploadContentModel;

        documentServiceSpy.createDocument.and.returnValue(of(mockDocument));

        expect(documentServiceSpy.createDocument).not.toHaveBeenCalled();

        strategy.execute(uploadModel).subscribe({
            next: (document) => {
                expect(document).toEqual(mockDocument);
                expect(documentServiceSpy.createDocument).toHaveBeenCalledWith(mockDocument);
                done();
            },
        });
    });
});
