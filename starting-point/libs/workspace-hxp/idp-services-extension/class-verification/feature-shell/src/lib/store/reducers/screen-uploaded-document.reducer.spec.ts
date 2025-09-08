/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { systemActions } from '../actions/class-verification.actions';
import { screenImportingDocumentReducer } from './screen-uploaded-document.reducer';
import {
    initialScreenImportingDocumentState,
    ScreenImportingDocumentState,
    ImportingDocument,
    DocumentImportingStatus,
} from '../states/importing-document.state';
import { IdpFileMetadata } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('Screen Uploaded Document State Reducer', () => {
    it('should return input state on unknown action', () => {
        const action = { type: 'Unknown' };
        const state = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state).toEqual(initialScreenImportingDocumentState);
    });

    it('should set state on screenLoadDocumentUploadSuccess', () => {
        const action = systemActions.screenLoadDocumentUploadSuccess({ enabled: true });
        const state: ScreenImportingDocumentState = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state.enabled).toEqual(true);
    });

    it('should reset state on screenLoadDocumentUploadError', () => {
        const action = systemActions.screenLoadDocumentUploadError({});
        const state: ScreenImportingDocumentState = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state.enabled).toEqual(false);
        expect(state.processFolderId).toBeUndefined();
    });

    it('should set running to true on documentImportStarted', () => {
        const action = systemActions.documentImportStarted();
        const state: ScreenImportingDocumentState = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state.running).toEqual(true);
    });

    it('should set running to false on documentImportFinished', () => {
        const action = systemActions.documentImportFinished();
        const state: ScreenImportingDocumentState = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state.running).toEqual(false);
    });

    it('should add documents on queueDocumentUploadSuccess', () => {
        const documents: ImportingDocument[] = [
            {
                id: 'doc1',
                fileName: 'doc1.pdf',
                importingStatus: DocumentImportingStatus.Pending,
                progress: 0,
            },
            {
                id: 'doc2',
                fileName: 'doc2.png',
                importingStatus: DocumentImportingStatus.Pending,
                progress: 0,
            },
        ];
        const action = systemActions.queueDocumentUploadSuccess({ documents });
        const state = screenImportingDocumentReducer(initialScreenImportingDocumentState, action);
        expect(state.ids.length).toBe(2);
        expect(state.entities['doc1']).toEqual(documents[0]);
        expect(state.entities['doc2']).toEqual(documents[1]);
    });

    it('should update document progress on documentUploadProgress', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 0,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const action = systemActions.documentUploadProgress({ documentId: 'doc1', progress: 50 });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Progress);
        expect(state.entities['doc1']?.progress).toEqual(50);
    });

    it('should not change document status on documentUploadComplete', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 100,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const action = systemActions.documentUploadComplete({ documentId: 'doc1', fileUploadId: 'file1upload' });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.fileUploadId).toEqual('file1upload');
        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Progress);
    });

    it('should update document status to Cancelled on documentUploadCancelled', () => {
        const document1: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 30,
        };
        const document2: ImportingDocument = {
            id: 'doc2',
            fileName: 'doc2.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document1, document2] })
        );

        const action = systemActions.documentUploadCancelled({ documentIds: [document1.id, document2.id] });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Cancelled);
    });

    it('should update document status to Error and set errorCode on documentUploadError', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const errorCode = 1;
        const action = systemActions.documentUploadError({ documentId: 'doc1', errorCode });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Error);
        expect(state.entities['doc1']?.errorCode).toEqual(errorCode);
    });

    it('should set document sysId and processFolderId on uploadedDocumentCreated', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileUploadId: 'file1upload',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state: ScreenImportingDocumentState = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const action = systemActions.uploadedDocumentCreated({ documentId: 'doc1', sysId: 'sys1', processFolderId: 'process-folder' });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.sysId).toEqual('sys1');
        expect(state.processFolderId).toEqual('process-folder');
    });

    it('should not set processFolderId on uploadedDocumentCreated when tate already has processFolderId set', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileUploadId: 'file1upload',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state: ScreenImportingDocumentState = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );
        state = { ...state, processFolderId: 'existing-process-folder' };

        const action = systemActions.uploadedDocumentCreated({ documentId: 'doc1', sysId: 'sys1', processFolderId: 'process-folder' });
        state = screenImportingDocumentReducer(state, action);

        expect(state.processFolderId).toEqual('existing-process-folder');
    });

    it('should update importing status to Error on uploadedDocumentReceivedMetadataError', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const action = systemActions.uploadedDocumentReceivedMetadataError({ documentId: 'doc1' });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Error);
    });

    it('should update importing status to Complete on uploadedDocumentReceivedMetadataSuccess', () => {
        const document: ImportingDocument = {
            id: 'doc1',
            fileName: 'doc1.pdf',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 70,
        };
        let state = screenImportingDocumentReducer(
            initialScreenImportingDocumentState,
            systemActions.queueDocumentUploadSuccess({ documents: [document] })
        );

        const metadata: IdpFileMetadata = {
            status: 'Queued',
            pageCount: 0,
            pages: [],
        };

        const action = systemActions.uploadedDocumentReceivedMetadataSuccess({ metadata, documentId: 'doc1', uploadedDocument: document });
        state = screenImportingDocumentReducer(state, action);

        expect(state.entities['doc1']?.importingStatus).toEqual(DocumentImportingStatus.Complete);
    });
});
