/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { screenUnloadMetaReducer } from './screen-unload-meta.reducer';
import { getClassVerificationRootReducer } from './class-verification-root.reducer';
import { ClassVerificationRootState, initialClassVerificationRootState } from '../states/root.state';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { userActions, systemActions } from '../actions/class-verification.actions';

describe('screenUnloadMetaReducer', () => {
    const reducer = screenUnloadMetaReducer(getClassVerificationRootReducer);

    it('should return initial state when input state is not set', () => {
        const state = reducer(undefined, userActions.viewFilterToggle);
        expect(state).toEqual(initialClassVerificationRootState);
    });

    it('should return initial state when action is screenUnload', () => {
        let state: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            screen: {
                ...initialClassVerificationRootState.screen,
                status: IdpLoadState.Loaded,
            },
        };
        state = reducer(state, systemActions.screenUnload);
        expect(state).toEqual(initialClassVerificationRootState);
    });

    it('should return the reducer when state is supplied and action is not screenUnload', () => {
        const state = reducer(initialClassVerificationRootState, systemActions.screenLoadSuccess);
        expect(state.screen.status).toBe(IdpLoadState.Loaded);
    });
});
