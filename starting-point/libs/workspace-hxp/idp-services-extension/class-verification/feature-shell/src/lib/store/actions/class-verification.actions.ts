/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../models/common-models';
import { IdpDocumentPage, IdpTaskData } from '../../models/screen-models';
import { DocumentEntity, DocumentState } from '../states/document.state';
import { DocumentStateUpdate, IdpPagesMetadata } from '../models/document-state-updates';
import { IdpDocumentAction } from './../../models/screen-models';
import { IdpFileMetadata, IdpTaskActions, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ImportingDocument } from '../states/importing-document.state';

interface DocActionCommonProps {
    docAction: IdpDocumentAction;
    canUndoAction: boolean;
    pages: IdpDocumentPage[];
}

export const userActions = createActionGroup({
    source: 'Hx Idp Class Verification User',
    events: {
        // document and page structure actions
        pageMerge: props<DocActionCommonProps & { targetDocumentId: string }>(),
        pageSplit: props<DocActionCommonProps & { createAfterDocId?: string }>(),
        pageMove: props<DocActionCommonProps & { targetDocumentId: string; targetIndex: number }>(),
        pageDelete: props<DocActionCommonProps>(),
        documentClassChange: props<DocActionCommonProps & { classId: string }>(),
        documentResolve: props<DocActionCommonProps>(),
        documentReject: props<DocActionCommonProps & { rejectReasonId: string; rejectNote?: string }>(),
        updatePagesRotation: props<{ pages: IdpPagesMetadata[]; taskDataSynced?: boolean }>(),

        // selection and ui state actions
        pageSelect: props<{ pageIds: string[] }>(),
        documentExpandToggle: props<{ documentId: string }>(),
        documentPreviewToggle: props<{ documentId?: string }>(),
        documentDragToggle: props<{ documentId: string }>(),

        // class actions
        classSelect: props<{ classId: string }>(),
        classExpandToggle: props<{ classId: string }>(),
        classPreviewToggle: props<{ classId?: string }>(),

        // view actions
        viewFilterChange: props<{ filter: IdpScreenViewFilter }>(),
        viewFilterToggle: emptyProps(),
        changeFullScreen: props<{ fullScreen: boolean }>(),
        sortOptionChange: props<{ option: IdpScreenViewSortOption }>(),

        // undo redo actions
        undoAction: emptyProps(),
        redoAction: emptyProps(),

        // task actions
        taskSave: emptyProps(),
        taskComplete: props<{ openNextTask?: boolean }>(),
        taskCancel: emptyProps(),

        // document upload
        queueDocumentUpload: props<{ files: File[] }>(),
        cancelDocumentUpload: props<{ documentIds: string[] }>(),

        copyDocumentDetailsToClipboard: props<{ documentId: string }>(),
    },
});

export const systemActions = createActionGroup({
    source: 'Hx Idp Class Verification System',
    events: {
        // screen actions
        screenInitialize: props<{ taskContext: TaskContext }>(),
        screenInitializeError: props<{ error: Error | string }>(),
        screenLoad: props<{ taskContext: TaskContext }>(),
        screenLoadSuccess: props<{ taskData: IdpTaskData; taskContext: TaskContext }>(),
        screenLoadError: props<{ error: Error }>(),
        screenUnload: emptyProps(),

        // document actions
        createDocuments: props<{ documents: DocumentEntity[] }>(),
        documentOperationSuccess: props<{
            docAction: IdpDocumentAction;
            canUndoAction: boolean;
            updates: DocumentStateUpdate[];
            contextPageIds: string[];
            notificationMessage: string;
            messageArgs?: Record<string, any>;
        }>(),
        documentOperationError: props<{
            docAction: IdpDocumentAction;
            error: Error | string;
            notificationMessage: string;
            messageArgs?: Record<string, any>;
        }>(),
        applyDocumentUpdates: props<{ updates: DocumentStateUpdate[]; isUndo?: boolean; isRedo?: boolean }>(),

        // notification actions
        notificationShow: props<{ severity: 'info' | 'success' | 'error' | 'warn'; message: string; messageArgs?: Record<string, any> }>(),

        // task actions
        taskActionSuccess: props<{ action: IdpTaskActions; openNextTask?: boolean }>(),
        taskActionError: props<{ error: Error | string; action?: IdpTaskActions }>(),
        taskPrepareUpdate: props<{ taskAction: IdpTaskActions; openNextTask?: boolean }>(),
        taskPrepareUpdateSuccess: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData; openNextTask?: boolean }>(),
        taskPrepareUpdateError: props<{ taskAction: IdpTaskActions; error: Error | string }>(),

        updateDocumentsRotation: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData; openNextTask?: boolean }>(),

        // undo redo actions
        registerUndoDocumentOperation: props<{ docState: DocumentState; updates: DocumentStateUpdate[] }>(),
        undoAction: props<{ docState: DocumentState }>(),
        redoAction: props<{ docState: DocumentState }>(),

        // task claim
        taskClaim: props<{ taskContext: TaskContext }>(),
        taskClaimSuccess: props<{ taskContext: TaskContext }>(),
        taskUnclaim: emptyProps(),

        // screen document upload actions
        screenLoadDocumentUpload: props<{ taskData: IdpTaskData }>(),
        screenLoadDocumentUploadSuccess: props<{ enabled: boolean }>(),
        screenLoadDocumentUploadError: props<{ message?: string }>(),
        documentImportStarted: emptyProps(),
        documentImportFinished: emptyProps(),
        queueDocumentUploadSuccess: props<{ documents: ImportingDocument[] }>(),
        queueDocumentUploadError: props<{ documents: ImportingDocument[] }>(),
        documentUploadProgress: props<{ documentId: string; progress: number }>(),
        documentUploadComplete: props<{ documentId: string; fileUploadId: string }>(),
        documentUploadCancelled: props<{ documentIds: string[] }>(),
        documentUploadError: props<{ documentId: string; errorCode?: number }>(),
        uploadedDocumentCreated: props<{ documentId: string; sysId: string; processFolderId?: string }>(),
        uploadedDocumentReceivedMetadataSuccess: props<{ metadata: IdpFileMetadata; documentId: string; uploadedDocument: ImportingDocument }>(),
        uploadedDocumentReceivedMetadataError: props<{ documentId: string }>(),
        uploadedDocumentReceivedMetadataCancelled: props<{ documentIds: string[] }>(),

        copyDocumentDetailsToClipboardSuccess: props<{ documentId: string }>(),
    },
});
