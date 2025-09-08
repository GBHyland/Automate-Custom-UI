/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, combineReducers, MetaReducer } from '@ngrx/store';
import { documentReducer } from './document.reducer';
import { FieldVerificationRootState, initialFieldVerificationRootState } from '../states/root.state';
import { screenReducer } from './screen.reducer';
import { screenUnloadMetaReducer } from './screen-unload-meta.reducer';
import { documentFieldReducer } from './document-field.reducer';
import { documentTableReducer } from './document-table.reducer';

const fieldVerificationRootReducer = combineReducers(
    {
        document: documentReducer,
        fields: documentFieldReducer,
        tables: documentTableReducer,
        screen: screenReducer,
    },
    initialFieldVerificationRootState
);

export function getFieldVerificationRootReducer(state: FieldVerificationRootState | undefined, action: Action) {
    return fieldVerificationRootReducer(state, action);
}

export const metaReducers: MetaReducer<FieldVerificationRootState>[] = [screenUnloadMetaReducer];
