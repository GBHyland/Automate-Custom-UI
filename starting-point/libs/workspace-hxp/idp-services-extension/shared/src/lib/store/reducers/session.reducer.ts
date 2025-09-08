/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { sharedUserActions } from '../actions/verification.actions';
import { initialSessionState } from '../states/session.state';

export const sessionReducer = createReducer(
    initialSessionState,
    on(sharedUserActions.toggleAutoNextTask, (state) => ({
        ...state,
        isAutoNextTaskChecked: !state.isAutoNextTaskChecked,
    }))
);
