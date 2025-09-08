/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContextEnvsPipe } from './context-envs.pipe';
import { mockApps, mockUniqueEnvs } from '../mocks/pipes/context-envs.pipe.mock';

describe('ContextEnvsPipe', () => {
    const pipe = new ContextEnvsPipe();

    it('should return list of unique envs based of app list', () => {
        expect(pipe.transform(mockApps)).toEqual(mockUniqueEnvs);
    });
});
