/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document, Group, User } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, Observable, combineLatest, merge, of } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, take, takeUntil } from 'rxjs/operators';
import { IdentityType, PermissionsManagementRow } from '../models/permissions-management-row.model';
import { PermissionsManagementState, PublicApi, initialState } from '../models/permissions-management.state';

type PermissionStateUpdateFn = (state: PermissionsManagementState) => Partial<PermissionsManagementState>;

@Injectable()
export class PermissionsManagementStateService {
    private readonly stateSubject: BehaviorSubject<PermissionsManagementState> = new BehaviorSubject<PermissionsManagementState>(initialState);

    private readonly state$: Observable<PermissionsManagementState> = this.stateSubject.asObservable();

    private document$: Observable<Document> = this.select(({ document }) => document).pipe(filter((document) => !!document)) as Observable<Document>;

    private loading$: Observable<boolean> = this.select(({ loading }) => loading);

    private activeTab$: Observable<IdentityType> = this.select(({ activeTab }) => activeTab);

    private searchUserField$: Observable<string> = this.select(({ searchUserField }) => searchUserField);

    private searchGroupField$: Observable<string> = this.select(({ searchGroupField }) => searchGroupField);

    private isInheritanceEnabled$: Observable<boolean> = this.select(({ isInheritanceEnabled }) => isInheritanceEnabled);

    private initialInheritance$: Observable<boolean> = this.select(({ initialInheritance }) => initialInheritance);

    private permissionsManagementRows$: Observable<PermissionsManagementRow[]> = this.select(({ permissions }) => permissions);

    private suggestedUsers$: Observable<User[]> = this.select(({ suggestedUsers }) => suggestedUsers);

    private suggestedGroups$: Observable<Group[]> = this.select(({ suggestedGroups }) => suggestedGroups);

    private suggestedAvailableUsers$: Observable<User[]> = combineLatest([this.permissionsManagementRows$, this.suggestedUsers$]).pipe(
        map(([permissions, suggestions]) => suggestions.filter((item) => this.canUserBeSuggested(permissions, item.id)))
    );

    private suggestedAvailableGroups$: Observable<Group[]> = combineLatest([this.permissionsManagementRows$, this.suggestedGroups$]).pipe(
        map(([permissions, suggestions]) => suggestions.filter((item) => this.canGroupBeSuggested(permissions, item.id)))
    );

    private title$: Observable<string> = merge(
        of('').pipe(takeUntil(this.document$)),
        this.document$.pipe(map((document) => document.sys_title ?? ''))
    );

    private sys_id$: Observable<string> = this.document$.pipe(map((document) => document.sys_id ?? ''));

    private activePermissionsManagementRows$ = combineLatest([
        this.permissionsManagementRows$,
        this.activeTab$,
        this.searchUserField$,
        this.searchGroupField$,
    ]).pipe(
        map(([permissions, activeTab, searchUserField, searchGroupField]) => {
            const textFields: Record<IdentityType, string> = {
                user: searchUserField,
                group: searchGroupField,
            };
            const textToFilter = textFields[activeTab].toLowerCase();
            return permissions.filter(
                ({ entityType, entityLabel = '' }) => entityType === activeTab && entityLabel.toLowerCase().includes(textToFilter)
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private isUntouched$ = combineLatest([this.permissionsManagementRows$, this.isInheritanceEnabled$, this.initialInheritance$]).pipe(
        map(
            ([permissions, isInheritanceEnabled, initialInheritance]) =>
                isInheritanceEnabled === initialInheritance && !permissions.some(({ edited }) => edited)
        )
    );

    private hasLocalPermission$ = this.permissionsManagementRows$.pipe(
        map((permissions) => permissions.some(({ permission }) => permission !== undefined))
    );

    get publicApi(): PublicApi {
        return {
            title$: this.title$,
            loading$: this.loading$,
            activePermissionsManagementRows$: this.activePermissionsManagementRows$,
            suggestedUsers$: this.suggestedAvailableUsers$,
            suggestedGroups$: this.suggestedAvailableGroups$,
            isUntouched$: this.isUntouched$,
            permissionsManagementRows$: this.permissionsManagementRows$,
            sys_id$: this.sys_id$,
            initialInheritance$: this.initialInheritance$,
            isInheritanceEnabled$: this.isInheritanceEnabled$,
            hasLocalPermission$: this.hasLocalPermission$,
        };
    }

    updateState(stateUpdateFn: PermissionStateUpdateFn | Partial<PermissionsManagementState>) {
        this.state$.pipe(take(1)).subscribe({
            next: (state: PermissionsManagementState) => {
                const partialState = typeof stateUpdateFn === 'function' ? stateUpdateFn(state) : stateUpdateFn;
                this.stateSubject.next({ ...state, ...partialState });
            },
            error: () => {
                throw new Error('[PermissionsManagementStateService]: error updating state');
            },
        });
    }

    private select<T>(fn: (state: PermissionsManagementState) => T) {
        return this.state$.pipe(map(fn), distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));
    }

    private canUserBeSuggested(permissions: PermissionsManagementRow[] = [], id: string = ''): boolean {
        return (
            !!id &&
            permissions.every(
                (permission) => permission.entityId !== id || (!permission.permission && permission.inheritedPermission !== 'Everything')
            )
        );
    }

    private canGroupBeSuggested(permissions: PermissionsManagementRow[] = [], id: string = ''): boolean {
        return !!id && permissions.every((permission) => permission.entityId !== id);
    }
}
