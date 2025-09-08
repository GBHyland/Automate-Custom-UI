/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { screenUnloadMetaReducer } from './screen-unload-meta.reducer';
import { FieldVerificationRootState, initialFieldVerificationRootState } from '../states/root.state';
import { systemActions } from '../actions/field-verification.actions';
import { ActionReducer } from '@ngrx/store';
import { fieldVerificationRootState } from '../shared-mock-states';

describe('screenUnloadMetaReducer', () => {
    let mockReducer: ActionReducer<FieldVerificationRootState>;

    beforeEach(() => {
        mockReducer = jasmine.createSpy('mockReducer').and.callFake((state = initialFieldVerificationRootState) => state);
    });

    it('should return initial state if state is undefined', () => {
        const action = { type: 'UNKNOWN' };
        const result = screenUnloadMetaReducer(mockReducer)(undefined, action);
        expect(result).toEqual(initialFieldVerificationRootState);
    });

    it('should return initial state if action type is screenUnload', () => {
        const action = systemActions.screenUnload();
        const state: FieldVerificationRootState = { ...initialFieldVerificationRootState };
        const result = screenUnloadMetaReducer(mockReducer)(state, action);
        expect(result).toEqual(initialFieldVerificationRootState);
    });

    it('should call the reducer with the current state and action if action type is not screenUnload', () => {
        const action = { type: 'UNKNOWN' };
        const state: FieldVerificationRootState = { ...fieldVerificationRootState };
        screenUnloadMetaReducer(mockReducer)(state, action);
        expect(mockReducer).toHaveBeenCalledWith(state, action);
    });

    it('should return the result of the reducer if action type is not screenUnload', () => {
        const action = { type: 'UNKNOWN' };
        const state: FieldVerificationRootState = { ...fieldVerificationRootState };
        const expectedState: FieldVerificationRootState = { ...state };
        (mockReducer as any).and.returnValue(expectedState);
        const result = screenUnloadMetaReducer(mockReducer)(state, action);
        expect(result).toEqual(expectedState);
    });
});
