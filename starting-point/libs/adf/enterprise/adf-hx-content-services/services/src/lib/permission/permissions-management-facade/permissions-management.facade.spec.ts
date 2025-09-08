/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { firstValueFrom, lastValueFrom, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { newPermissionEntity, newPermissionManagementRow } from '../mocks/permissions-management.mocks';
import { NewPermissionEntity, Permission, PermissionsManagementRow } from '../models/permissions-management-row.model';
import { PermissionsManagementFacade } from './permissions-management.facade';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { USER_API_TOKEN, GROUP_API_TOKEN, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { GroupApi, UserApi, Document } from '@hylandsoftware/hxcs-js-client';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PermissionsParserService } from '../permissions-parser/permissions-parser.service';
import { MockProvider } from 'ng-mocks';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../../adf-enterprise-adf-hx-content-services-services.providers';
import { DocumentService } from '../../document/document.service';
import { PermissionsManagementStateService } from '../permissions-management-state/permissions-management-state.service';
import { Component, DestroyRef, inject } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PermissionsDataAccessService } from '../permissions-data-access/permissions-data-access.service';
import { UserType } from '../models/user-type.enum';

const mockIdentityUserService = {
    getCurrentUserInfo: () => ({ id: '0000-fake-user-uuid-0000' }),
} as unknown as IIdentityUserService;

const parentDocumentWithAcl: Document = {
    sys_id: 'parent-doc-id',
    sys_primaryType: 'sys_folder',
    sys_acl: [
        {
            creator: 'creator-id-2',
            user: {
                id: 'id-5',
                lastName: 'Lenders',
                firstName: 'Mark',
            },
            permission: 'ReadWrite',
            granted: true,
            status: 'EFFECTIVE',
        },
    ],
    sys_effectiveAcl: [],
};

@Component({
    selector: 'hxp-test-component',
    template: `<div>Test Component</div>`,
    imports: [MatSnackBarModule],
    standalone: true,
    providers: [PermissionsManagementFacade, PermissionsManagementStateService],
})
export class TestComponent {
    private destroyRef = inject(DestroyRef);

    constructor(public permissionsManagementFacade: PermissionsManagementFacade) {
        permissionsManagementFacade.onInitializePermissionsManagement(jestMocks.documentWithAcl, parentDocumentWithAcl, this.destroyRef);
    }
}

describe('PermissionsManagementFacade', () => {
    const documentWithOnlyInheritedPermissions = {
        ...jestMocks.documentWithAcl,
        sys_acl: [],
    };
    let fixture: ComponentFixture<TestComponent>;
    let permissionsManagementFacade: PermissionsManagementFacade;
    let destroyRef: DestroyRef;
    let searchUsersByNameSpy: jest.SpyInstance;
    let searchGroupsByNameSpy: jest.SpyInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, TestComponent],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                DocumentService,
                MockProvider(IDENTITY_USER_SERVICE_TOKEN, mockIdentityUserService),
            ],
        });
        const userApi: UserApi = TestBed.inject(USER_API_TOKEN);
        const groupApi: GroupApi = TestBed.inject(GROUP_API_TOKEN);
        searchUsersByNameSpy = jest.spyOn(userApi, 'searchUsersByName').mockImplementation((textToSearch: string | undefined = '') =>
            generateMockResponse({
                data: [
                    { name: 'joe', id: 'user-1' },
                    { name: 'john', id: 'user-2' },
                ].filter(({ name }) => textToSearch.length > 0 && name.includes(textToSearch)),
            })
        );

        searchGroupsByNameSpy = jest.spyOn(groupApi, 'searchGroups').mockImplementation((textToSearch: string | undefined = '') =>
            generateMockResponse({
                data: [
                    { name: 'group1', id: 'id-group1' },
                    { name: 'group2', id: 'id-group2' },
                    { name: 'group3', id: 'id-group3' },
                ].filter(({ name }) => textToSearch.length > 0 && name.includes(textToSearch)),
            })
        );

        destroyRef = TestBed.inject(DestroyRef);
        fixture = TestBed.createComponent(TestComponent);
        permissionsManagementFacade = fixture.componentInstance.permissionsManagementFacade;
        permissionsManagementFacade.onInitializePermissionsManagement(documentWithOnlyInheritedPermissions, parentDocumentWithAcl, destroyRef);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should subscribe to user input events only once', fakeAsync(() => {
        permissionsManagementFacade.onInitializePermissionsManagement(jestMocks.documentWithAcl, parentDocumentWithAcl, destroyRef);
        permissionsManagementFacade.onInitializePermissionsManagement(jestMocks.documentWithAcl, parentDocumentWithAcl, destroyRef);
        const observer = {
            next: jest.fn(),
        };
        permissionsManagementFacade.onSearchUserField('text to search');
        tick(1050);
        permissionsManagementFacade.api.activePermissionsManagementRows$.subscribe(observer);
        flush();

        expect(observer.next).toHaveBeenCalledTimes(1);
    }));

    it('should receive distinct values', fakeAsync(() => {
        const observer = {
            next: jest.fn(),
        };
        const textToSearch = 'same text to search';
        permissionsManagementFacade.onSearchUserField(textToSearch);
        permissionsManagementFacade.onSearchUserField(textToSearch);
        permissionsManagementFacade.onSearchUserField(textToSearch);
        permissionsManagementFacade.onSearchUserField(textToSearch);
        permissionsManagementFacade.onSearchUserField(textToSearch);
        tick(1000);
        permissionsManagementFacade.api.activePermissionsManagementRows$.subscribe(observer);
        flush();

        expect(observer.next).toHaveBeenCalledTimes(1);
    }));

    it('should unsubscribe when the component using the service is destroyed', async () => {
        fixture.destroy();
        permissionsManagementFacade.onSearchUserField('no user or group');
        const permissions = await firstValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$);

        expect(permissions).not.toHaveLength(0);
    });

    it('should refresh list of permissions when changing active tab', async () => {
        permissionsManagementFacade.onUpdateActiveTab('user');
        const permissions = await firstValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$);

        expect(permissions).toHaveLength(2);
        expect(permissions).toEqual(expect.not.arrayContaining([expect.objectContaining({ entityType: 'group' })]));
    });

    it('should add a permission to the permissions list', async () => {
        const index = jestMocks.documentWithAcl.sys_acl.length;
        permissionsManagementFacade.onUpdateActiveTab('user');
        permissionsManagementFacade.onAddNewPermissionsManagementRow(newPermissionEntity);
        const permissions = await firstValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$);

        expect(permissions).toHaveLength(3);
        expect(permissions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    ...newPermissionManagementRow,
                    index,
                }),
            ])
        );
    });

    it('should update a permission to the permissions list', async () => {
        const index = jestMocks.documentWithAcl.sys_acl.length;
        permissionsManagementFacade.onUpdateActiveTab('user');
        permissionsManagementFacade.onAddNewPermissionsManagementRow(newPermissionEntity);
        const editedPermissionsManagementRow = {
            ...newPermissionManagementRow,
            edited: true,
            permission: 'None' as Permission,
            index,
        };
        permissionsManagementFacade.onEditPermissionsManagementRow(editedPermissionsManagementRow);
        const permissions = await firstValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$);

        expect(permissions).toHaveLength(3);
        expect(newPermissionManagementRow.permission).toBe('Everything');
        expect(permissions[2].edited).toBe(true);
        expect(permissions[2].permission).toBe('None');
        expect(permissions[2].entityLabel).toBe(editedPermissionsManagementRow.entityLabel);
        expect(permissions[2].entityId).toBe(editedPermissionsManagementRow.entityId);
    });

    it('should load suggestions of users', async () => {
        expect(searchUsersByNameSpy).toHaveBeenCalledTimes(0);

        permissionsManagementFacade.onNewUserField('joe');

        let loading = await lastValueFrom(permissionsManagementFacade.api.loading$.pipe(take(2)));

        expect(loading).toBe(true);

        const suggestedUsers = await lastValueFrom(permissionsManagementFacade.api.suggestedUsers$.pipe(take(1)));

        expect(suggestedUsers).toHaveLength(1);

        const suggestedGroups = await firstValueFrom(permissionsManagementFacade.api.suggestedGroups$);

        expect(suggestedGroups).toStrictEqual([]);
        expect(searchUsersByNameSpy).toHaveBeenCalledTimes(1);

        loading = await firstValueFrom(permissionsManagementFacade.api.loading$);

        expect(loading).toBe(false);
    });

    it('should load suggestions of groups', async () => {
        expect(searchGroupsByNameSpy).toHaveBeenCalledTimes(0);

        permissionsManagementFacade.onNewGroupField('group');
        const loading = await lastValueFrom(permissionsManagementFacade.api.loading$.pipe(take(2)));

        expect(loading).toBe(true);

        const suggestedUsers = await firstValueFrom(permissionsManagementFacade.api.suggestedUsers$);

        expect(suggestedUsers).toStrictEqual([]);

        const suggestedGroups = await firstValueFrom(permissionsManagementFacade.api.suggestedGroups$);

        expect(suggestedGroups).toHaveLength(3);
        expect(searchGroupsByNameSpy).toHaveBeenCalledTimes(1);
    });

    it('should not suggest groups already in the permissions list, except the ones with inherited permissions', async () => {
        permissionsManagementFacade.onNewGroupField('group3');
        const loading = await lastValueFrom(permissionsManagementFacade.api.loading$.pipe(take(2)));

        expect(loading).toBe(true);

        let suggestedGroups = await lastValueFrom(permissionsManagementFacade.api.suggestedGroups$.pipe(take(1)));

        expect(suggestedGroups).toHaveLength(1);

        const newGroupPermissionEntity: Readonly<NewPermissionEntity> = {
            permission: 'ReadWrite',
            entityType: 'group',
            entity: {
                id: 'id-group3',
                name: 'group3',
            },
            entityLabel: 'group3',
            entityId: 'id-group3',
        };
        permissionsManagementFacade.onAddNewPermissionsManagementRow(newGroupPermissionEntity);
        permissionsManagementFacade.onNewGroupField('group3');
        suggestedGroups = await firstValueFrom(permissionsManagementFacade.api.suggestedGroups$);

        expect(suggestedGroups).toHaveLength(0);
    });

    it('should not suggest users already in the permissions list, except the ones with inherited permissions', async () => {
        permissionsManagementFacade.onUpdateActiveTab('user');
        permissionsManagementFacade.onNewUserField('joe');
        const loading = await lastValueFrom(permissionsManagementFacade.api.loading$.pipe(take(2)));

        expect(loading).toBe(true);

        let suggestedUsers = await lastValueFrom(permissionsManagementFacade.api.suggestedUsers$.pipe(take(1)));

        expect(suggestedUsers).toHaveLength(1);

        const newUserPermissionEntity: Readonly<NewPermissionEntity> = {
            permission: 'ReadWrite',
            entityType: 'user',
            entity: {
                id: 'id-userJoe',
                firstName: 'joe',
                lastName: 'jackson',
            },
            entityLabel: 'joe jackson',
            entityId: 'id-userJoe',
        };
        permissionsManagementFacade.onAddNewPermissionsManagementRow(newUserPermissionEntity);
        permissionsManagementFacade.onNewUserField('joe');
        suggestedUsers = await firstValueFrom(permissionsManagementFacade.api.suggestedGroups$.pipe(take(1)));

        expect(suggestedUsers).toHaveLength(0);
    });

    // flaky test failing randomly
    // eslint-disable-next-line ban/ban
    xit('should filter group permissions list', async () => {
        permissionsManagementFacade.onSearchGroupField('2');
        permissionsManagementFacade.onSearchUserField('John');
        const groups = await firstValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$.pipe(take(3)));

        expect(groups).toHaveLength(1);
        if (groups) {
            expect(groups[0].entityLabel).toContain('2');
        } else {
            fail('groups is undefined');
        }

        permissionsManagementFacade.onUpdateActiveTab('user');
        const users = await lastValueFrom(permissionsManagementFacade.api.activePermissionsManagementRows$.pipe(take(2)));

        expect(users).toHaveLength(1);
        if (users) {
            expect(users[0].entityLabel).toContain('John');
        } else {
            fail('users is undefined');
        }
    });
    it('should not save inherited permissions', async () => {
        const permissionsParserService = TestBed.inject(PermissionsParserService);
        const permissionsManagementRow: PermissionsManagementRow = {
            index: 9,
            ...newPermissionEntity,
            isNew: true,
            edited: true,
            inherited: false,
            overridden: false,
            inheritedPermission: 'None',
        };
        const sys_acl = permissionsParserService.permissionsManagementRowsToAcl([permissionsManagementRow]);
        const documentService = TestBed.inject(DocumentService);
        const updateDocumentSpy = spyOn(documentService, 'updateDocument').and.returnValue(of(documentWithOnlyInheritedPermissions));

        expect(updateDocumentSpy).not.toHaveBeenCalled();

        permissionsManagementFacade.onUpdateActiveTab('user');
        permissionsManagementFacade.onAddNewPermissionsManagementRow(newPermissionEntity);
        const hasBeenSaved = await firstValueFrom(permissionsManagementFacade.updateDocumentAcl());

        expect(hasBeenSaved).toBe(true);
        expect(updateDocumentSpy).toHaveBeenCalledWith(documentWithOnlyInheritedPermissions.sys_id as string, { sys_acl });
    });

    it('should update the document ACL correctly when inheritance is toggled off', async () => {
        const sysIdMock = 'document-id';
        const permissionsMock: PermissionsManagementRow[] = [
            {
                permission: 'Read',
                index: 0,
                inheritedPermission: 'None',
                isNew: false,
                edited: false,
                inherited: false,
                overridden: false,
                entityType: 'user',
                entityId: 'user1',
                entityLabel: 'User 1',
                entity: {
                    id: 'user1',
                    name: 'User 1',
                },
            },
        ];

        const expectedAclDisabled = [
            ...permissionsMock.map((perm) => ({
                user: perm.entity,
                permission: perm.permission,
                creator: undefined,
                granted: undefined,
            })),
            {
                user: '__Everyone__',
                permission: 'Everything',
                granted: false,
            },
        ];

        Object.defineProperty(permissionsManagementFacade.api, 'sys_id$', {
            get: () => of(sysIdMock),
        });
        Object.defineProperty(permissionsManagementFacade.api, 'permissionsManagementRows$', {
            get: () => of(permissionsMock),
        });
        Object.defineProperty(permissionsManagementFacade.api, 'isInheritanceEnabled$', {
            get: () => of(false),
        });

        const permissionsDataAccessService = TestBed.inject(PermissionsDataAccessService);
        const updateDocumentSpy = jest.spyOn(permissionsDataAccessService, 'updateDocument').mockReturnValue(of(true));

        await firstValueFrom(permissionsManagementFacade.updateDocumentAcl());

        expect(updateDocumentSpy).toHaveBeenCalledWith(sysIdMock, expectedAclDisabled);
    });

    it('should restore permissions to inherited for USERS, GROUPS, and ALL', async () => {
        const documentService = TestBed.inject(DocumentService);
        const updateDocumentSpy = spyOn(documentService, 'updateDocument').and.returnValue(of(true));

        const restoreOptions = [UserType.USERS, UserType.GROUPS, UserType.ALL];

        permissionsManagementFacade.onInitializePermissionsManagement(jestMocks.documentWithAcl, parentDocumentWithAcl, destroyRef);

        for (const restoreOption of restoreOptions) {
            const result = await firstValueFrom(permissionsManagementFacade.restorePermissionsToInherited(restoreOption));

            expect(result).toBe(true);

            let expectedFilteredAcl;
            if (restoreOption === UserType.USERS) {
                expectedFilteredAcl = jestMocks.documentWithAcl.sys_acl.filter((row) => row.group);
            } else if (restoreOption === UserType.GROUPS) {
                expectedFilteredAcl = jestMocks.documentWithAcl.sys_acl.filter((row) => row.user);
            } else if (restoreOption === UserType.ALL) {
                expectedFilteredAcl = [];
            }

            expect(updateDocumentSpy).toHaveBeenCalledWith(jestMocks.documentWithAcl.sys_id, { sys_acl: expectedFilteredAcl });
        }
    });
});
