/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { ACE } from '@hylandsoftware/hxcs-js-client';
import { MockProvider } from 'ng-mocks';
import { newPermissionManagementRow } from '../mocks/permissions-management.mocks';
import { PermissionsParserService } from './permissions-parser.service';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../../adf-enterprise-adf-hx-content-services-services.providers';
import { Permission } from '../models/permissions-management-row.model';

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
    let permissionsParserService: PermissionsParserService;
    let sys_acl: ACE[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [provideAdfEnterpriseAdfHxContentServicesServices(), MockProvider(IDENTITY_USER_SERVICE_TOKEN, mockIdentityUserService)],
        });
        permissionsParserService = TestBed.inject(PermissionsParserService);
        sys_acl = [...jestMocks.documentWithAcl.sys_effectiveAcl];
    });

    it('should parse a Document and return an array of PermissionsManagementRows', () => {
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(jestMocks.documentWithAcl);

        expect(permissionsManagementRows).toHaveLength(sys_acl.length);
        expect(permissionsManagementRows[0].entityType).toBe('group');
        expect(permissionsManagementRows[1].entityType).toBe('user');
        expect(permissionsManagementRows[2].entityType).toBe('group');
        expect(permissionsManagementRows[0].permission).toBe('Read');
        expect(permissionsManagementRows[1].permission).toBe('ReadWrite');
        expect(permissionsManagementRows[2].permission).toBe('ReadWrite');
        expect(permissionsManagementRows[0].entityLabel).toBe('groupName');
        expect(permissionsManagementRows[1].entityLabel).toBe('John Doe');
        expect(permissionsManagementRows[2].entityLabel).toBe('groupName2');
    });

    it('should distinguish between inherited, overridden and nonhereditary permissions', () => {
        const documentWithInheritedAndOverriddenPermissions = getDocumentWithInheritedAndOverriddenPermissions();
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(documentWithInheritedAndOverriddenPermissions);

        expect(permissionsManagementRows).toHaveLength(9);
        expect(permissionsManagementRows[0].inherited).toBe(true);
        expect(permissionsManagementRows[0].overridden).toBe(true);
        for (let i = 1; i < permissionsManagementRows.length; i++) {
            expect(permissionsManagementRows[i].inherited).toBe(true);
            expect(permissionsManagementRows[i].overridden).toBe(false);
        }
    });

    it('should parse an array of PermissionsManagementRows back to a Document ACE list', () => {
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(jestMocks.documentWithAcl);

        expect(permissionsManagementRows).toHaveLength(sys_acl.length);

        const generatedAcl = permissionsParserService.permissionsManagementRowsToAcl(permissionsManagementRows);

        expect(generatedAcl).toHaveLength(sys_acl.length);

        const acl = jestMocks.documentWithAcl.sys_effectiveAcl;

        for (const [i, ace] of acl.entries()) {
            expect(generatedAcl[i].permission).toBe(ace.permission);
            expect(generatedAcl[i].creator).toBe(ace.creator);
            expect(generatedAcl[i].user).toBe(ace.user);
            expect(generatedAcl[i].group).toBe(ace.group);
        }
    });

    it('when adding a new permission, the user should be the creator', () => {
        const generatedAcl = permissionsParserService.permissionsManagementRowsToAcl([newPermissionManagementRow]);

        expect(generatedAcl[0].permission).toBe('Everything');
        expect(generatedAcl[0].user).toBeDefined();
        expect(generatedAcl[0].group).toBeUndefined();
        expect(generatedAcl[0].creator).toBe('0000-fake-user-uuid-0000');
    });

    it('should remove ACE entry when PermissionsManagementRow permission is "None"', () => {
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(jestMocks.documentWithAcl);

        expect(permissionsManagementRows).toHaveLength(sys_acl.length);

        permissionsManagementRows[0].permission = 'None';
        const generatedAcl = permissionsParserService.permissionsManagementRowsToAcl(permissionsManagementRows);

        expect(generatedAcl).toHaveLength(sys_acl.length - 1);
    });

    it('should remove ACE entry when PermissionsManagementRow is inherited from ancestors', () => {
        const documentWithInheritedAndOverriddenPermissions = getDocumentWithInheritedAndOverriddenPermissions();
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(documentWithInheritedAndOverriddenPermissions);

        expect(permissionsManagementRows).toHaveLength(9);

        const generatedAcl = permissionsParserService.permissionsManagementRowsToAcl(permissionsManagementRows);

        expect(generatedAcl).toHaveLength(documentWithInheritedAndOverriddenPermissions.sys_acl.length);
    });

    it('should set inherited and local permissions', () => {
        const documentWithInheritedAndOverriddenPermissions = getDocumentWithInheritedAndOverriddenPermissions();
        const permissionsManagementRows = permissionsParserService.aclToPermissionsManagementRows(documentWithInheritedAndOverriddenPermissions);

        expect(permissionsManagementRows[0].inheritedPermission).toBe('Read');
        expect(permissionsManagementRows[0].permission).toBe('ReadWrite');
        expect(permissionsManagementRows[0].overridden).toBe(true);
        expect(permissionsManagementRows[0].inherited).toBe(true);
    });
});
