/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { initialSessionState, SessionState } from './session.state';

export const sharedVerificationStateName = 'idp-shared-verification';

export interface SharedVerificationRootState {
    session: SessionState;
}

export const initialSharedVerificationRootState: SharedVerificationRootState = {
    session: initialSessionState,
};
