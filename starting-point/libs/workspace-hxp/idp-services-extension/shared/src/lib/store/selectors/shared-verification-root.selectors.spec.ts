/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { initialSessionState, SessionState } from '../states/session.state';
import { initialSharedVerificationRootState, SharedVerificationRootState } from '../states/shared-verification-root.state';
import { sessionFeatureSelector } from './shared-verification-root.selectors';

describe('Shared Verification Root Selectors', () => {
    it('should select session state', () => {
        const mockSessionState: SessionState = {
            ...initialSessionState,
            isAutoNextTaskChecked: true,
        };

        const mockState: SharedVerificationRootState = {
            ...initialSharedVerificationRootState,
            session: mockSessionState,
        };

        const result = sessionFeatureSelector.projector(mockState);
        expect(result).toBeDefined();
        expect(result.isAutoNextTaskChecked).toBe(true);
    });
});
