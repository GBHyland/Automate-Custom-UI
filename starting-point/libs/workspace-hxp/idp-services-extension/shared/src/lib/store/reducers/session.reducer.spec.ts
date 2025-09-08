/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { sharedUserActions } from '../actions/verification.actions';
import { sessionReducer } from '../reducers/session.reducer';
import { initialSessionState } from '../states/session.state';

describe('Session State Reducer', () => {
    it('should return input state on unknown action', () => {
        const action = { type: 'Unknown' };
        const state = sessionReducer(initialSessionState, action);
        expect(state).toEqual(initialSessionState);
    });

    it('should toggle isAutoNextTaskChecked on toggleAutoNextTask action', () => {
        const action = sharedUserActions.toggleAutoNextTask();
        const state = sessionReducer(initialSessionState, action);
        expect(state.isAutoNextTaskChecked).toEqual(false);
    });
});
