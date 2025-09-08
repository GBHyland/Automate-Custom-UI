/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { screenImportingDocumentFeatureSelector } from './class-verification-root.selectors';
import { screenImportingDocumentAdapter } from '../states/importing-document.state';

export const selectIsDocumentImportEnabled = createSelector(screenImportingDocumentFeatureSelector, (state) => state.enabled);

export const selectIsDocumentImportRunning = createSelector(screenImportingDocumentFeatureSelector, (state) => state.running);

export const selectAcceptedFileExtensions = createSelector(screenImportingDocumentFeatureSelector, (state) => state.acceptFileExtensions);

export const selectAcceptedFileSize = createSelector(screenImportingDocumentFeatureSelector, (state) => state.acceptFileSizeBytes);

export const selectUploadFolderId = createSelector(screenImportingDocumentFeatureSelector, (state) => state.processFolderId);

export const selectAllImportingDocuments = createSelector(
    screenImportingDocumentFeatureSelector,
    screenImportingDocumentAdapter.getSelectors().selectAll
);

export const selectImportingDocumentById = (id: string) =>
    createSelector(selectAllImportingDocuments, (documents) =>
        documents.find((document) => document.sysId === id || document.fileUploadId === id || document.id === id)
    );

export const selectImportingDocumentProgress = (id: string) => createSelector(selectImportingDocumentById(id), (document) => document?.progress);

export const selectImportingDocumentStatus = (id: string) => createSelector(selectImportingDocumentById(id), (document) => document?.importingStatus);

export const selectImportingDocumentErrorCode = (id: string) => createSelector(selectImportingDocumentById(id), (document) => document?.errorCode);
