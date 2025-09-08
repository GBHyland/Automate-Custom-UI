/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { MockProvider } from 'ng-mocks';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';
import { Permission } from '../models/permissions-management-row.model';
import { PermissionsParserHelper } from './permissions-parser.helper';
import { getHighestAce } from '../utils/permissions-utils';

const mockIdentityUserService = {
    getCurrentUserInfo: () => ({ id: '0000-fake-user-uuid-0000' }),
} as unknown as IIdentityUserService;

const getDocumentWithInheritedAndOverriddenPermissions = (permission: Permission = 'ReadWrite') => {
    const acl = jestMocks.documentWithAcl.sys_effectiveAcl;
    const localAce = { ...acl[0], permission };
    const sys_effectiveAcl = [localAce, ...acl];
    return {
        ...jestMocks.documentWithAcl,
        sys_acl: [{ ...localAce }],
        sys_effectiveAcl,
    };
};

describe('PermissionsParserService', () => {
    let permissionsParserHelperService: PermissionsParserHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockProvider(IDENTITY_USER_SERVICE_TOKEN, mockIdentityUserService)],
        });
        permissionsParserHelperService = TestBed.inject(PermissionsParserHelper);
    });

    it('should group ACL by permission entity (users and groups)', () => {
        const document = getDocumentWithInheritedAndOverriddenPermissions();
        const aclGroupedByEntity = permissionsParserHelperService.getAclGroupedByPermissionsEntity(document);

        expect(aclGroupedByEntity).toHaveLength(9);
        expect(aclGroupedByEntity[0].entity.entityType).toBe('group');
        expect(aclGroupedByEntity[0].entity.entityLabel).toBe('groupName');
        expect(aclGroupedByEntity[0].local).toHaveLength(1);
        expect(aclGroupedByEntity[0].inherited).toHaveLength(1);
        for (let i = 1; i < aclGroupedByEntity.length; i++) {
            expect(aclGroupedByEntity[i].local).toHaveLength(0);
            expect(aclGroupedByEntity[i].inherited).toHaveLength(1);
        }
    });

    it('should return the highest permission available to the user', () => {
        const { sys_effectiveAcl } = getDocumentWithInheritedAndOverriddenPermissions('ReadWrite');
        let highestAce = getHighestAce(sys_effectiveAcl);

        expect(highestAce?.permission).toBe('ReadWrite');

        const { sys_effectiveAcl: anotherAcl } = getDocumentWithInheritedAndOverriddenPermissions('Everything');
        highestAce = getHighestAce(anotherAcl);

        expect(highestAce?.permission).toBe('Everything');
    });
});
