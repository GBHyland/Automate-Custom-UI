/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IdpConfigClass } from '../../models/screen-models';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export interface DocumentClassState extends EntityState<IdpConfigClass> {
    selectedClassId?: string;
    expandedClassId?: string;
    previewedClassId?: string;
    loadState: IdpLoadState;
}

export const documentClassAdapter = createEntityAdapter<IdpConfigClass>();

export const initialDocumentClassState: DocumentClassState = documentClassAdapter.getInitialState({
    selectedClassId: undefined,
    expandedClassId: undefined,
    loadState: IdpLoadState.NotInitialized,
});
