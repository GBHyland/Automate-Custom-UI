/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ApiBaseDocument, TaskInput, RejectReason, ContentFileReference, ApiDocPage } from '@hxp/workspace-hxp/idp-services-extension/shared';

export interface ClassVerificationInput extends TaskInput {
    batchState: ClassVerificationBatchState;
    rejectReasons: RejectReason[];
    targetFolder?: string;
}

export interface ClassVerificationBatchState {
    documents: ApiDocument[];
    deletedPages?: ApiDocPage[];
    separationStatus?: 'Awaiting' | 'Separated' | 'ReviewRequired';
    classificationStatus?: 'Awaiting' | 'Classified' | 'ReviewRequired';
    extractionStatus?: 'Awaiting' | 'Extracted' | 'ReviewRequired';
    hasRejectedDocuments?: boolean;
    // in the future this property will no longer be optional
    contentFileReferences?: ContentFileReference[];
}

export interface ApiDocument extends ApiBaseDocument, TransientApiDocument {
    markAsDeleted?: boolean;
    markAsRejected?: boolean;
    markAsResolved?: boolean;
    classificationConfidence?: number;
    rejectReasonId?: string;
    rejectNote?: string;
    classId?: string;
    className?: string;
    classificationReviewStatus?: 'ReviewRequired' | 'ReviewNotRequired';
}

export interface TransientApiDocument {
    reprocess?: boolean;
}
