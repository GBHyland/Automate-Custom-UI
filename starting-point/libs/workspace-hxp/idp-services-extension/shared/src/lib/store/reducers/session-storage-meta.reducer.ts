/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionReducer } from '@ngrx/store';
import { SessionState } from '../states/session.state';

let hasLoadedFromSession = false;

export function sessionStorageMetaReducer(reducer: ActionReducer<SessionState>): ActionReducer<SessionState> {
    return (state, action) => {
        if (!hasLoadedFromSession) {
            hasLoadedFromSession = true;
            const savedPersistenceState = sessionStorage.getItem('idpSessionState');
            if (savedPersistenceState) {
                try {
                    return reducer(JSON.parse(savedPersistenceState), action);
                } catch {
                    console.warn('Failed to parse session storage state');
                }
            }
        }

        const updatedState = reducer(state, action);
        if (updatedState !== state) {
            sessionStorage.setItem('idpSessionState', JSON.stringify(updatedState));
        }
        return updatedState;
    };
}
