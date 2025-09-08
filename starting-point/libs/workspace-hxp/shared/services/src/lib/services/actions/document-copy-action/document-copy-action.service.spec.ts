/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentCopyActionService } from './document-copy-action.service';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';

describe('DocumentCopyActionService', () => {
    let service: DocumentCopyActionService;
    let documentServiceMock: jest.Mocked<DocumentService>;
    let translateServiceMock: jest.Mocked<TranslateService>;

    beforeEach(() => {
        documentServiceMock = {
            copyDocument: jest.fn(),
            updateDocument: jest.fn(),
            moveDocument: jest.fn(),
        } as unknown as jest.Mocked<DocumentService>;

        translateServiceMock = {
            instant: jest.fn(),
        } as unknown as jest.Mocked<TranslateService>;

        TestBed.configureTestingModule({
            providers: [
                DocumentCopyActionService,
                { provide: DocumentService, useValue: documentServiceMock },
                { provide: TranslateService, useValue: translateServiceMock },
            ],
        });

        service = TestBed.inject(DocumentCopyActionService);
    });

    it('should copy a document and emit documentPathChange$', async () => {
        const copyDocument: Document = { sys_id: '1', sys_name: 'doc1', sys_title: 'doc1', sys_parentId: 'folder1' } as Document;
        const targetFolder: Document = { sys_id: '2' } as Document;
        const copiedDocument: Document = { sys_id: '3', sys_parentId: 'folder2' } as Document;
        documentServiceMock.copyDocument.mockReturnValue(of({ document: copiedDocument, status: 'SUCCESS' }));
        documentServiceMock.updateDocument.mockReturnValue(of(copiedDocument));
        translateServiceMock.instant.mockReturnValue('Copy of');

        const changePromise = firstValueFrom(service.documentPathChange$);
        const result = await firstValueFrom(service.copy(copyDocument, targetFolder));

        expect(result).toEqual(copiedDocument);
        expect(documentServiceMock.copyDocument).toHaveBeenCalledWith('1', 'Copy of doc1', '2');
        expect(documentServiceMock.updateDocument).toHaveBeenCalledWith('3', { sys_title: 'Copy of doc1' });

        const change = await changePromise;

        expect(change).toEqual({ origin: 'folder1', target: 'folder2' });
    });

    it('should not emit documentPathChange$ if copyDocument fails', async () => {
        const copyDocument: Document = { sys_id: '1', sys_name: 'doc1', sys_title: 'doc1', sys_parentId: 'folder1' } as Document;
        const targetFolder: Document = { sys_id: '2' } as Document;
        documentServiceMock.copyDocument.mockReturnValue(of({ document: undefined, status: 'ERROR' }));
        translateServiceMock.instant.mockReturnValue('Copy of');

        service.documentPathChange$.subscribe(() => {
            fail('documentPathChange$ should not emit');
        });

        const result = await firstValueFrom(service.copy(copyDocument, targetFolder));

        expect(result).toBeUndefined();
        expect(documentServiceMock.copyDocument).toHaveBeenCalledWith('1', 'Copy of doc1', '2');
    });
});
