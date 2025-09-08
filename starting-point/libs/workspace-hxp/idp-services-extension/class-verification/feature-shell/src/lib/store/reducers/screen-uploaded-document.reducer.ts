/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import {
    DocumentImportingStatus,
    initialScreenImportingDocumentState,
    screenImportingDocumentAdapter,
    ScreenImportingDocumentState,
} from '../states/importing-document.state';
import { systemActions } from '../actions/class-verification.actions';

export const screenImportingDocumentReducer = createReducer(
    initialScreenImportingDocumentState,

    on(systemActions.screenLoadDocumentUploadSuccess, (state, { enabled }) => {
        return {
            ...state,
            enabled,
            running: false,
        };
    }),

    on(systemActions.screenLoadDocumentUploadError, (state) => {
        return {
            ...state,
            enabled: false,
            running: false,
            processFolderId: undefined,
        };
    }),

    on(systemActions.documentImportStarted, (state) => {
        return {
            ...state,
            running: true,
        };
    }),

    on(systemActions.documentImportFinished, (state) => {
        return {
            ...state,
            running: false,
        };
    }),

    on(systemActions.queueDocumentUploadSuccess, systemActions.queueDocumentUploadError, (state, { documents }) => {
        return screenImportingDocumentAdapter.addMany(documents, state);
    }),

    on(systemActions.documentUploadProgress, (state, { documentId, progress }) => {
        return screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Progress, progress },
            },
            state
        );
    }),

    on(systemActions.documentUploadComplete, (state, { documentId, fileUploadId }) => {
        return screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { fileUploadId, importingStatus: DocumentImportingStatus.Progress },
            },
            state
        );
    }),

    on(systemActions.documentUploadCancelled, (state, { documentIds }) => {
        return screenImportingDocumentAdapter.updateMany(
            documentIds.map((documentId) => ({
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Cancelled },
            })),
            state
        );
    }),

    on(systemActions.uploadedDocumentReceivedMetadataCancelled, (state, { documentIds }) => {
        return screenImportingDocumentAdapter.updateMany(
            documentIds.map((documentId) => ({
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Cancelled },
            })),
            state
        );
    }),

    on(systemActions.documentUploadError, (state, { documentId, errorCode }) => {
        return screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Error, errorCode },
            },
            state
        );
    }),

    on(systemActions.uploadedDocumentCreated, (state, { documentId, sysId, processFolderId }) =>
        screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { sysId },
            },
            (state as ScreenImportingDocumentState).processFolderId ? state : { ...state, processFolderId }
        )
    ),

    on(systemActions.uploadedDocumentReceivedMetadataError, (state, { documentId }) =>
        screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Error },
            },
            state
        )
    ),

    on(systemActions.uploadedDocumentReceivedMetadataSuccess, (state, { documentId }) =>
        screenImportingDocumentAdapter.updateOne(
            {
                id: documentId,
                changes: { importingStatus: DocumentImportingStatus.Complete, progress: 100 },
            },
            state
        )
    )
);
