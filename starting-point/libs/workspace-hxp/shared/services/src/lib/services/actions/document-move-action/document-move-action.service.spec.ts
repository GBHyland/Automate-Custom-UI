/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { TestBed } from '@angular/core/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom, of } from 'rxjs';
import { DocumentMoveActionService } from './document-move-action.service';

describe('DocumentMoveActionService', () => {
    let service: DocumentMoveActionService;
    let documentServiceMock: jest.Mocked<DocumentService>;

    beforeEach(() => {
        documentServiceMock = {
            copyDocument: jest.fn(),
            moveDocument: jest.fn(),
        } as unknown as jest.Mocked<DocumentService>;

        TestBed.configureTestingModule({
            providers: [DocumentMoveActionService, { provide: DocumentService, useValue: documentServiceMock }],
        });

        service = TestBed.inject(DocumentMoveActionService);
    });

    it('should move a document and emit documentPathChange$', async () => {
        const moveDocument: Document = { sys_id: '1', sys_parentId: 'folder1' } as Document;
        const targetFolder: Document = { sys_id: '2' } as Document;
        const movedDocument: Document = { sys_id: '1', sys_parentId: 'folder2' } as Document;
        documentServiceMock.moveDocument.mockReturnValue(of({ document: movedDocument, status: 'SUCCESS' }));

        const changePromise = firstValueFrom(service.documentPathChange$);
        const result = await firstValueFrom(service.move(moveDocument, targetFolder));

        expect(result).toEqual(movedDocument);
        expect(documentServiceMock.moveDocument).toHaveBeenCalledWith('1', '2');

        const change = await changePromise;

        expect(change).toEqual({ origin: 'folder1', target: 'folder2' });
    });

    it('should not emit documentPathChange$ if moveDocument fails', async () => {
        const moveDocument: Document = { sys_id: '1', sys_parentId: 'folder1' } as Document;
        const targetFolder: Document = { sys_id: '2' } as Document;
        documentServiceMock.moveDocument.mockReturnValue(of({ document: undefined, status: 'ERROR' }));

        service.documentPathChange$.subscribe(() => {
            fail('documentPathChange$ should not emit');
        });

        const result = await firstValueFrom(service.move(moveDocument, targetFolder));

        expect(result).toBeUndefined();
        expect(documentServiceMock.moveDocument).toHaveBeenCalledWith('1', '2');
    });
});
