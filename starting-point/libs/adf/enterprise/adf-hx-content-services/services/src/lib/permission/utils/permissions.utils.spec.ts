/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { isPermissionInheritanceEnabled } from './permissions-utils';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';

describe('Permission Utils', () => {
    it('should return correct inheritance status from document ACL', () => {
        let result = isPermissionInheritanceEnabled(jestMocks.documentWithAcl);
        expect(result).toBe(true);

        jestMocks.documentWithAcl.sys_acl.push({
            user: { id: '__Everyone__' },
            permission: 'Everything',
            granted: false,
            status: 'EFFECTIVE',
        });

        result = isPermissionInheritanceEnabled(jestMocks.documentWithAcl);
        expect(result).toBe(false);
    });
});
