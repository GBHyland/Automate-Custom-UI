/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IdpDocumentPage } from '@hxp/workspace-hxp/idp-services-extension/shared';

export type DocumentPageEntity = Omit<IdpDocumentPage, 'documentId' | 'fileReference' | 'viewerRotation' | 'hasIssue' | 'isSelected'> & {
    contentFileReferenceIndex: number;
    markAsDeleted?: boolean;
};

export type DocumentPageState = EntityState<DocumentPageEntity>;

export const documentPageAdapter = createEntityAdapter<DocumentPageEntity>();

export const initialDocumentPageState: DocumentPageState = documentPageAdapter.getInitialState();
