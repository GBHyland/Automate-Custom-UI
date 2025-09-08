/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    DocumentImportingStatus,
    initialScreenImportingDocumentState,
    screenImportingDocumentAdapter,
    ScreenImportingDocumentState,
} from '../states/importing-document.state';
import {
    selectAcceptedFileExtensions,
    selectAcceptedFileSize,
    selectAllImportingDocuments,
    selectImportingDocumentErrorCode,
    selectImportingDocumentProgress,
    selectImportingDocumentStatus,
    selectIsDocumentImportEnabled,
    selectIsDocumentImportRunning,
    selectImportingDocumentById,
    selectUploadFolderId,
} from './screen-importing-document.selectors';

describe('Screen Importing Documents Selectors', () => {
    it('should select is document import enabled', () => {
        const mockState: ScreenImportingDocumentState = {
            ...initialScreenImportingDocumentState,
            enabled: true,
        };
        const result = selectIsDocumentImportEnabled.projector(mockState);
        expect(result).toBe(true);
    });

    it('should select is document import running', () => {
        const mockState: ScreenImportingDocumentState = {
            ...initialScreenImportingDocumentState,
            running: true,
        };
        const result = selectIsDocumentImportRunning.projector(mockState);
        expect(result).toBe(true);
    });

    it('should select accepted file extensions', () => {
        const mockState: ScreenImportingDocumentState = {
            ...initialScreenImportingDocumentState,
            acceptFileExtensions: ['.pdf', '.docx'],
        };
        const result = selectAcceptedFileExtensions.projector(mockState);
        expect(result).toEqual(['.pdf', '.docx']);
    });

    it('should select accepted file size', () => {
        const mockState: ScreenImportingDocumentState = {
            ...initialScreenImportingDocumentState,
            acceptFileSizeBytes: 50 * 1024 * 1024,
        };
        const result = selectAcceptedFileSize.projector(mockState);
        expect(result).toBe(50 * 1024 * 1024);
    });

    it('should select upload folder id', () => {
        const mockState: ScreenImportingDocumentState = {
            ...initialScreenImportingDocumentState,
            processFolderId: '12345',
        };
        const result = selectUploadFolderId.projector(mockState);
        expect(result).toBe('12345');
    });

    it('should select all importing documents', () => {
        const uploadedDocumentEntities = [
            { id: '1', fileName: 'file1.pdf', importingStatus: 'complete', progress: 100 },
            { id: '2', fileName: 'file2.jpg', importingStatus: 'cancelled', progress: 50 },
        ];
        const mockState: ScreenImportingDocumentState = screenImportingDocumentAdapter.setAll(
            uploadedDocumentEntities,
            initialScreenImportingDocumentState
        );

        const result = selectAllImportingDocuments.projector(mockState);
        expect(result).toEqual(uploadedDocumentEntities);
    });

    it('should select importing document by id', () => {
        const documents = [
            {
                id: '1',
                fileName: 'file1.pdf',
                importingStatus: DocumentImportingStatus.Pending,
                progress: 0,
            },
            {
                id: '2',
                fileName: 'file2.pdf',
                importingStatus: DocumentImportingStatus.Progress,
                progress: 30,
            },
        ];
        const result = selectImportingDocumentById(documents[1].id).projector(documents);
        expect(result).toEqual(documents[1]);
    });

    it('should select importing document progress', () => {
        const document = {
            id: '2',
            fileName: 'file2.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 30,
        };
        const result = selectImportingDocumentProgress(document.id).projector(document);
        expect(result).toEqual(document.progress);
    });

    it('should select importing document status', () => {
        const document = {
            id: '2',
            fileName: 'file2.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 30,
        };
        const result = selectImportingDocumentStatus(document.id).projector(document);
        expect(result).toEqual(document.importingStatus);
    });

    it('should select importing document error code', () => {
        const document = {
            id: '2',
            fileName: 'file2.pdf',
            importingStatus: DocumentImportingStatus.Error,
            progress: 30,
            errorCode: 101,
        };
        const result = selectImportingDocumentErrorCode(document.id).projector(document);
        expect(result).toEqual(document.errorCode);
    });
});
