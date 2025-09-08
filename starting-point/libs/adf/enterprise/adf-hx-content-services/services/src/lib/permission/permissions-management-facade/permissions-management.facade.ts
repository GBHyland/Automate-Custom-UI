/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Inject, Injectable } from '@angular/core';
import { ACE, Document, GroupApi, UserApi } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, Observable, combineLatest, concat, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, switchMap, take } from 'rxjs/operators';
import {
    IdentityType,
    NewPermission,
    NewPermissionEntity,
    InheritedPermissionEntity,
    PermissionEntity,
    PermissionsManagementRow,
} from '../models/permissions-management-row.model';
import { PermissionsManagementState, PublicApi, initialState } from '../models/permissions-management.state';
import { PermissionsDataAccessService } from '../permissions-data-access/permissions-data-access.service';
import { PermissionsManagementStateService } from '../permissions-management-state/permissions-management-state.service';
import { PermissionsParserService } from '../permissions-parser/permissions-parser.service';
import { USER_API_TOKEN, GROUP_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    isAclInheritanceBlocked,
    isPermissionInheritanceEnabled,
    EVERYONE_USER_ID,
    EVERYTHING_PERMISSION,
    removeUserTypeFromAcl,
} from '../utils/permissions-utils';
import { UserType } from '../models/user-type.enum';

@Injectable()
export class PermissionsManagementFacade {
    readonly api: Readonly<PublicApi>;
    readonly suggestedIndividuals$: Observable<InheritedPermissionEntity[]>;
    readonly suggestedGroups$: Observable<PermissionEntity[]>;

    private searchUserFieldSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private searchGroupFieldSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private newUserFieldSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private newGroupFieldSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

    private searchUserField$: Observable<string> = this.getDebouncedValueForServerRequestObservable(this.searchUserFieldSubject);
    private searchGroupField$: Observable<string> = this.getDebouncedValueForServerRequestObservable(this.searchGroupFieldSubject);
    private newUserField$: Observable<string> = this.getDebouncedValueForServerRequestObservable(this.newUserFieldSubject);
    private newGroupField$: Observable<string> = this.getDebouncedValueForServerRequestObservable(this.newGroupFieldSubject);

    private initialized = false;

    constructor(
        private permissionsManagementStateService: PermissionsManagementStateService,
        private permissionsParserService: PermissionsParserService,
        private permissionsDataAccessService: PermissionsDataAccessService,
        @Inject(USER_API_TOKEN) private userApi: UserApi,
        @Inject(GROUP_API_TOKEN) private groupApi: GroupApi
    ) {
        this.api = this.permissionsManagementStateService.publicApi;

        // when the Individual Users tab will be like the User Groups one (with inherited column)
        // it will be possible to restore back previous/cleaner implementation:
        // this.suggestedIndividuals$ = this.api.suggestedUsers$.pipe(map(this.permissionsParserService.getEntityPropertiesFromUsers));
        this.suggestedIndividuals$ = combineLatest([
            this.api.suggestedUsers$.pipe(map(this.permissionsParserService.getEntityPropertiesFromUsers)),
            this.api.activePermissionsManagementRows$,
        ]).pipe(
            map(([suggestedUsers, userPermissionsManagementRows]): InheritedPermissionEntity[] =>
                suggestedUsers.map((suggestedUser) => {
                    const row = userPermissionsManagementRows.find(({ entityId }) => entityId === suggestedUser.entityId);
                    const inheritedPermissionEntity: InheritedPermissionEntity = {
                        ...suggestedUser,
                        inheritedPermission: row?.inheritedPermission as NewPermission,
                    };
                    return inheritedPermissionEntity;
                })
            )
        );
        this.suggestedGroups$ = this.api.suggestedGroups$.pipe(map(this.permissionsParserService.getEntityPropertiesFromGroups));
    }

    onInitializePermissionsManagement(document: Document, parentDocument: Document, destroyRef: DestroyRef) {
        if (!this.initialized) {
            this.subscribeToKeyboardTypes(destroyRef);
            this.initialized = true;
            const unregisterFn = destroyRef.onDestroy(() => {
                this.initialized = false;
                unregisterFn();
            });
        }

        const isInheritanceEnabled = isPermissionInheritanceEnabled(document);
        const inheritedPermissions: ACE[] = !isInheritanceEnabled ? parentDocument.sys_effectiveAcl || [] : [];
        const permissions = this.permissionsParserService.aclToPermissionsManagementRows({
            sys_acl: document.sys_acl,
            sys_effectiveAcl: [...(document.sys_effectiveAcl || []), ...inheritedPermissions],
        });

        this.permissionsManagementStateService.updateState({
            ...initialState,
            document,
            permissions,
            initialInheritance: isInheritanceEnabled,
            isInheritanceEnabled,
        });
    }

    onUpdateActiveTab(activeTab: IdentityType) {
        this.permissionsManagementStateService.updateState({ activeTab });
    }

    onSearchUserField(searchUserField: string) {
        this.searchUserFieldSubject.next(searchUserField);
    }

    onSearchGroupField(searchGroupField: string) {
        this.searchGroupFieldSubject.next(searchGroupField);
    }

    onNewUserField(newUserField: string) {
        this.newUserFieldSubject.next(newUserField);
    }

    onNewGroupField(newGroupField: string) {
        this.newGroupFieldSubject.next(newGroupField);
    }

    onAddNewPermissionsManagementRow(newPermissionEntity: NewPermissionEntity) {
        this.permissionsManagementStateService.updateState((state) => {
            const index = state.permissions.length;
            const permissionsManagementRow: PermissionsManagementRow = {
                index,
                ...newPermissionEntity,
                isNew: true,
                edited: true,
                inherited: false,
                overridden: false,
                inheritedPermission: 'None',
            };
            return { permissions: [...state.permissions, permissionsManagementRow] };
        });
    }

    onEditPermissionsManagementRow(permissionsManagementRow: PermissionsManagementRow) {
        this.permissionsManagementStateService.updateState(({ permissions }) => {
            const permissionIndex = permissionsManagementRow.index;
            if (permissionIndex > -1) {
                permissions = [
                    ...permissions.slice(0, permissionIndex),
                    { ...permissionsManagementRow, edited: true },
                    ...permissions.slice(permissionIndex + 1),
                ];
            }
            return { permissions };
        });
    }

    onUpdateInheritanceState(isEnabled: boolean): void {
        this.permissionsManagementStateService.updateState({ isInheritanceEnabled: isEnabled });
    }

    updateDocumentAcl(): Observable<boolean> {
        return combineLatest([this.api.sys_id$, this.api.permissionsManagementRows$, this.api.isInheritanceEnabled$]).pipe(
            take(1),
            switchMap(([sys_id, permissions, isInheritanceEnabled]) => {
                if (!sys_id) {
                    return of(false);
                }

                let acl = this.permissionsParserService.permissionsManagementRowsToAcl(permissions, isInheritanceEnabled);

                acl = !isInheritanceEnabled
                    ? [
                          ...acl,
                          {
                              user: EVERYONE_USER_ID,
                              permission: EVERYTHING_PERMISSION,
                              granted: false,
                          } as any,
                      ]
                    : acl.filter((ace) => !isAclInheritanceBlocked(ace));

                return this.permissionsDataAccessService.updateDocument(sys_id, acl);
            })
        );
    }

    restorePermissionsToInherited(restoreOption: UserType): Observable<boolean> {
        return combineLatest([this.api.sys_id$, this.api.permissionsManagementRows$]).pipe(
            take(1),
            map(([sys_id, permissions]) => {
                if (!sys_id) {
                    return null;
                }

                const acl = this.permissionsParserService.permissionsManagementRowsToAcl(permissions);
                const filteredAcl = removeUserTypeFromAcl(acl, restoreOption);

                return { sys_id, sys_acl: filteredAcl };
            }),
            switchMap((data) =>
                data && data.sys_acl !== null ? this.permissionsDataAccessService.updateDocument(data.sys_id, data.sys_acl, restoreOption) : of(false)
            )
        );
    }

    private getDebouncedValueForServerRequestObservable<T>(subject: BehaviorSubject<T>): Observable<T> {
        const observable = subject.asObservable();
        return concat(observable.pipe(take(1)), observable.pipe(debounceTime(1000), distinctUntilChanged()));
    }

    private subscribeToKeyboardTypes(destroyRef: DestroyRef) {
        this.subscribeAndExecuteFunctionToUpdateState(this.searchUserField$, destroyRef, (searchUserField) => ({
            searchUserField,
        }));
        this.subscribeAndExecuteFunctionToUpdateState(this.searchGroupField$, destroyRef, (searchGroupField) => ({
            searchGroupField,
        }));
        this.subscribeAndExecuteFunctionToUpdateState(this.newUserField$, destroyRef, (newUserField) => {
            const loading = newUserField.length > 0;
            if (loading) {
                void this.requestUserSuggestions(newUserField);
                return { newUserField, loading };
            }
            return { newUserField, loading, suggestedUsers: [] };
        });
        this.subscribeAndExecuteFunctionToUpdateState(this.newGroupField$, destroyRef, (newGroupField) => {
            const loading = newGroupField.length > 0;
            if (loading) {
                void this.requestGroupSuggestions(newGroupField);
                return { newGroupField, loading };
            }
            return { newGroupField, loading, suggestedGroups: [] };
        });
    }

    private subscribeAndExecuteFunctionToUpdateState(
        observable: Observable<string>,
        destroyRef: DestroyRef,
        fn: (value: string) => Partial<PermissionsManagementState>
    ) {
        observable.pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }), takeUntilDestroyed(destroyRef)).subscribe({
            next: (value) => {
                const payload = fn(value);
                this.permissionsManagementStateService.updateState(payload);
            },
            error: (e: Error) => {
                throw new Error(`[PermissionsManagementFacade]: ${e.message}`);
            },
        });
    }

    private async requestUserSuggestions(textToSearch: string) {
        const { data: suggestedUsers = [] } = await this.userApi.searchUsersByName(textToSearch);
        this.permissionsManagementStateService.updateState({
            suggestedUsers,
            loading: false,
        });
    }

    private async requestGroupSuggestions(textToSearch: string) {
        const { data: suggestedGroups = [] } = await this.groupApi.searchGroups(textToSearch);
        this.permissionsManagementStateService.updateState({
            suggestedGroups,
            loading: false,
        });
    }
}
