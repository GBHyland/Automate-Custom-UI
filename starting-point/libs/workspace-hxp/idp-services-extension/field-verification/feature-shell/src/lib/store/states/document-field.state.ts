/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IdpField } from '../../models/screen-models';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export type DocumentFieldEntity = Omit<IdpField, 'hasIssue' | 'isSelected'> & {
    order: number;
};

export interface DocumentFieldState extends EntityState<DocumentFieldEntity> {
    selectedFieldId?: string;
    needsKeyboardFocus?: boolean;
    loadState: IdpLoadState;
}

export const documentFieldAdapter = createEntityAdapter<DocumentFieldEntity>({
    sortComparer: (a, b) => a.order - b.order,
});

export const initialDocumentFieldState: DocumentFieldState = documentFieldAdapter.getInitialState({
    selectedFieldId: undefined,
    loadState: IdpLoadState.NotInitialized,
});
