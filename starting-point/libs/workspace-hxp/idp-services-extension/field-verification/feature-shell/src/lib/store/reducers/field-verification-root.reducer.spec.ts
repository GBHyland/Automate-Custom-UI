/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getFieldVerificationRootReducer, metaReducers } from './field-verification-root.reducer';
import { initialFieldVerificationRootState } from '../states/root.state';
import { Action } from '@ngrx/store';
import { screenUnloadMetaReducer } from './screen-unload-meta.reducer';
import { fieldVerificationRootState } from '../shared-mock-states';

describe('FieldVerificationRootReducer', () => {
    it('should return the initial state', () => {
        const action: Action = { type: 'UNKNOWN' };
        const state = getFieldVerificationRootReducer(undefined, action);
        expect(state).toEqual(initialFieldVerificationRootState);
    });

    it('should handle a known action', () => {
        const action: Action = { type: 'KNOWN_ACTION' };
        const state = getFieldVerificationRootReducer(fieldVerificationRootState, action);
        expect(state).toEqual(fieldVerificationRootState);
    });
});

describe('MetaReducers', () => {
    it('should include screenUnloadMetaReducer', () => {
        expect(metaReducers).toContain(screenUnloadMetaReducer);
    });
});
