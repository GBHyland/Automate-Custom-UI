/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IdpTable } from '../../models/screen-models';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export type DocumentTableEntity = Pick<IdpTable, 'id' | 'name' | 'columnHeaderNames'> & {
    rows: string[][];
};

export interface DocumentTableState extends EntityState<DocumentTableEntity> {
    loadState: IdpLoadState;
}

export const documentTableAdapter = createEntityAdapter<DocumentTableEntity>();

export const initialDocumentTableState: DocumentTableState = documentTableAdapter.getInitialState({
    loadState: IdpLoadState.NotInitialized,
});
