/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SessionState } from '../states/session.state';
import { selectIsAutoNextTaskChecked } from './session.selectors';

describe('Session Selectors', () => {
    it('should select auto next task checked', () => {
        const mockSessionState: SessionState = {
            isAutoNextTaskChecked: true,
        };

        const result1 = selectIsAutoNextTaskChecked.projector(mockSessionState);
        expect(result1).toBe(true);
    });
});
