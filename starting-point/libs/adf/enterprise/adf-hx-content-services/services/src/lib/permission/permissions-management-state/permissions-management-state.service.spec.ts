/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { mockPermissionManagementRows } from '../mocks/permissions-management.mocks';
import { initialState } from '../models/permissions-management.state';
import { PermissionsManagementStateService } from './permissions-management-state.service';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { firstValueFrom } from 'rxjs';

describe('PermissionsManagementStateService', () => {
    let permissionsManagementStateService: PermissionsManagementStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PermissionsManagementStateService, provideHttpClientTesting()],
        });
        permissionsManagementStateService = TestBed.inject(PermissionsManagementStateService);
    });

    it('should set the Permissions Management feature state', async () => {
        const { publicApi } = permissionsManagementStateService;
        jest.spyOn(permissionsManagementStateService, 'updateState');

        expect(permissionsManagementStateService.updateState).not.toHaveBeenCalled();
        permissionsManagementStateService.updateState({
            ...initialState,
        });

        const title = await firstValueFrom(publicApi.title$);
        const loading = await firstValueFrom(publicApi.loading$);
        const activePermissionsManagementRows = await firstValueFrom(publicApi.activePermissionsManagementRows$);
        const suggestedUsers = await firstValueFrom(publicApi.suggestedUsers$);
        const suggestedGroups = await firstValueFrom(publicApi.suggestedGroups$);
        const isUntouched = await firstValueFrom(publicApi.isUntouched$);

        expect(title).toBe('');
        expect(loading).toBe(initialState.loading);
        expect(activePermissionsManagementRows).toHaveLength(0);
        expect(suggestedUsers).toHaveLength(0);
        expect(suggestedGroups).toHaveLength(0);
        expect(isUntouched).toBe(true);
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(1);
    });

    it('should suggest User Groups without assigned permissions', async () => {
        const { publicApi } = permissionsManagementStateService;
        permissionsManagementStateService.updateState({
            ...initialState,
            permissions: mockPermissionManagementRows,
            newGroupField: 'groupName',
            suggestedGroups: [
                { id: 'id-group-1', name: 'groupName1' }, // has local permission
                { id: 'id-group-2', name: 'groupName2' }, // has inherited permission
                { id: 'id-group-X', name: 'groupNameX' }, // has no permissions assigned yet
            ],
        });
        const suggestedGroups = await firstValueFrom(publicApi.suggestedGroups$);

        expect(suggestedGroups).toHaveLength(1);
        expect(suggestedGroups[0].name).toBe('groupNameX');
    });

    it('should suggest Individual Users without assigned local permission', async () => {
        const { publicApi } = permissionsManagementStateService;
        permissionsManagementStateService.updateState({
            ...initialState,
            permissions: mockPermissionManagementRows,
            newUserField: 'Joh',
            suggestedUsers: [
                { id: 'id-user-1', firstName: 'John', lastName: 'Doe' }, // has inherited permission "Everything", no upgradable permissions
                { id: 'id-user-a', firstName: 'Johnny', lastName: 'Mox' }, // has local permission
                { id: 'id-user-b', firstName: 'Johan', lastName: 'Strauss' }, // has overridden permission (local + inherited)
                { id: 'id-user-c', firstName: 'Johnny', lastName: 'Speccy' }, // has inherited permission "Read", upgradable
                { id: 'id-user-X', firstName: 'Johnathan', lastName: 'Austin' }, // no permissions assigned yet
            ],
            activeTab: 'user',
        });
        const suggestedUsers = await firstValueFrom(publicApi.suggestedUsers$);

        expect(suggestedUsers).toHaveLength(2);
        expect(suggestedUsers[0].lastName).toBe('Speccy');
        expect(suggestedUsers[1].lastName).toBe('Austin');
    });

    it('given a Document, should update the Permissions Management feature state accordingly', async () => {
        const { publicApi } = permissionsManagementStateService;
        jest.spyOn(permissionsManagementStateService, 'updateState');

        expect(permissionsManagementStateService.updateState).not.toHaveBeenCalled();

        permissionsManagementStateService.updateState({
            ...initialState,
            document: jestMocks.documentWithAcl,
        });
        const title = await firstValueFrom(publicApi.title$);

        expect(title).toBe(jestMocks.documentWithAcl.sys_name);
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(1);
    });

    it('should update active PermissionsManagementRows when changing active tab', async () => {
        const { publicApi } = permissionsManagementStateService;
        jest.spyOn(permissionsManagementStateService, 'updateState');

        expect(permissionsManagementStateService.updateState).not.toHaveBeenCalled();

        permissionsManagementStateService.updateState({
            permissions: mockPermissionManagementRows,
        });
        let activePermissionsManagementRows = await firstValueFrom(publicApi.activePermissionsManagementRows$);

        expect(activePermissionsManagementRows).toHaveLength(2);
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(1);

        permissionsManagementStateService.updateState({ activeTab: 'group' });
        activePermissionsManagementRows = await firstValueFrom(publicApi.activePermissionsManagementRows$);

        expect(activePermissionsManagementRows).toHaveLength(2);
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(2);
    });

    it('should filter PermissionsManagementRows when a search text is provided', async () => {
        const { publicApi } = permissionsManagementStateService;
        jest.spyOn(permissionsManagementStateService, 'updateState');

        expect(permissionsManagementStateService.updateState).not.toHaveBeenCalled();

        permissionsManagementStateService.updateState({
            activeTab: 'group',
            searchGroupField: '2',
            searchUserField: 'DOe',
            permissions: mockPermissionManagementRows,
        });
        let activePermissionsManagementRows = await firstValueFrom(publicApi.activePermissionsManagementRows$.pipe(take(1)));

        expect(activePermissionsManagementRows).toHaveLength(1);
        expect(activePermissionsManagementRows[0].entityLabel).toBe('groupName2');
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(1);

        permissionsManagementStateService.updateState({ activeTab: 'user' });
        activePermissionsManagementRows = await firstValueFrom(publicApi.activePermissionsManagementRows$.pipe(take(1)));

        expect(activePermissionsManagementRows).toHaveLength(1);
        expect(activePermissionsManagementRows[0].entityLabel).toBe('John Doe');
        expect(permissionsManagementStateService.updateState).toHaveBeenCalledTimes(2);
    });

    it('should change isUntouched$ based on all contributing factors', async () => {
        const { publicApi } = permissionsManagementStateService;

        // Initial state: untouched
        permissionsManagementStateService.updateState({
            permissions: [],
            isInheritanceEnabled: true,
            initialInheritance: true,
        });
        let isUntouched = await firstValueFrom(publicApi.isUntouched$);

        expect(isUntouched).toBe(true);

        // Change permissions to include an edited row
        permissionsManagementStateService.updateState({
            permissions: [{ ...mockPermissionManagementRows[0], edited: true }],
        });
        isUntouched = await firstValueFrom(publicApi.isUntouched$);

        expect(isUntouched).toBe(false);

        // Reset permissions and mismatch inheritance states
        permissionsManagementStateService.updateState({
            permissions: [],
            isInheritanceEnabled: false,
        });
        isUntouched = await firstValueFrom(publicApi.isUntouched$);

        expect(isUntouched).toBe(false);
    });
});
