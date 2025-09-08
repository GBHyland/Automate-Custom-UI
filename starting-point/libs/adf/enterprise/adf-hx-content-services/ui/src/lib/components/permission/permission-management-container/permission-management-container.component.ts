/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    DocumentService,
    IdentityType,
    NewPermissionEntity,
    InheritedPermissionEntity,
    Permission,
    PermissionEntity,
    PermissionsManagementFacade,
    PermissionsManagementRow,
    PermissionsManagementStateService,
    UserType,
} from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { PermissionsTableComponent } from '../permissions-table/permissions-table.component';
import { PermissionsSearchComponent } from '../permission-search/permission-search.component';
import { PermissionsComponent } from '../permissions/permissions.component';
import { InheritedPermissionComponent } from '../inherited-permission/inherited-permission.component';
import { AddPermissionComponent } from '../add-permission/add-permission.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PermissionEmptyTableComponent } from '../permission-empty-table/permission-empty-table.component';
import { filter, Observable } from 'rxjs';
import { PermissionsDocumentTitleComponent } from '../permissions-document-title/permissions-document-title.component';
import { PermissionInheritanceToggleComponent } from '../permission-inheritance-toggle/permissions-inheritance-toggle.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-permission-management-container',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        MatIconModule,
        MatDividerModule,
        TranslatePipe,
        PermissionsTableComponent,
        PermissionsSearchComponent,
        PermissionsComponent,
        InheritedPermissionComponent,
        AddPermissionComponent,
        MatSnackBarModule,
        PermissionEmptyTableComponent,
        PermissionsDocumentTitleComponent,
        MatIconModule,
        PermissionInheritanceToggleComponent,
        CommonModule,
    ],
    providers: [PermissionsManagementFacade, PermissionsManagementStateService],
    templateUrl: './permission-management-container.component.html',
    styleUrls: ['./permission-management-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionManagementContainerComponent implements OnInit {
    @Input()
    document!: Document;

    @Input()
    parentDocument!: Document;

    @Output() cancelEvent = new EventEmitter();

    @Output() closeEvent: EventEmitter<any> = new EventEmitter();

    @Output() restoreEvent = new EventEmitter();

    @ContentChild('title', { static: false })
    titleTemplateRef?: TemplateRef<any>;
    protected suggestedGroups$: Observable<PermissionEntity[]>;
    protected suggestedIndividuals$: Observable<InheritedPermissionEntity[]>;
    protected title$: Observable<string>;
    protected activePermissionsManagementRows$: Observable<PermissionsManagementRow[]>;
    protected isUntouched$: Observable<boolean>;
    protected loading$: Observable<boolean>;
    protected edited = false;
    protected isInheritanceEnabled$: Observable<boolean>;
    protected hasLocalPermission$: Observable<boolean>;

    private destroyRef = inject(DestroyRef);

    constructor(private permissionsManagementFacade: PermissionsManagementFacade, private documentService: DocumentService) {
        this.suggestedGroups$ = this.permissionsManagementFacade.suggestedGroups$;
        this.suggestedIndividuals$ = this.permissionsManagementFacade.suggestedIndividuals$;
        this.title$ = this.permissionsManagementFacade.api.title$;
        this.activePermissionsManagementRows$ = this.permissionsManagementFacade.api.activePermissionsManagementRows$;
        this.isUntouched$ = this.permissionsManagementFacade.api.isUntouched$;
        this.loading$ = this.permissionsManagementFacade.api.loading$;
        this.isInheritanceEnabled$ = this.permissionsManagementFacade.api.isInheritanceEnabled$;
        this.hasLocalPermission$ = this.permissionsManagementFacade.api.hasLocalPermission$;
    }

    ngOnInit() {
        this.permissionsManagementFacade.onInitializePermissionsManagement(this.document, this.parentDocument, this.destroyRef);
        this.isUntouched$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (untouched) => (this.edited = !untouched),
            error: () => (this.edited = true),
        });
    }

    savePermissions() {
        this.saveDocumentPermissions()
            .pipe(filter(Boolean))
            .subscribe({
                next: () => {
                    this.documentService.requestReload();
                    this.closeEvent.emit();
                },
            });
    }

    restorePermissions(restoreOption: UserType) {
        this.restoreDocumentPermissions(restoreOption)
            .pipe(filter(Boolean))
            .subscribe({
                next: () => {
                    this.documentService.requestReload();
                    this.closeEvent.emit();
                },
            });
    }

    protected cancel() {
        this.cancelEvent.emit(this.edited);
    }

    protected closePermission() {
        this.closeEvent.emit(this.edited);
    }

    protected restore() {
        this.restoreEvent.emit();
    }

    protected onTabSelection(index: number) {
        const identityTypes: IdentityType[] = ['group', 'user'];
        this.permissionsManagementFacade.onUpdateActiveTab(identityTypes[index]);
    }

    protected onAddNewPermissionsManagementRow(newPermission: NewPermissionEntity) {
        this.permissionsManagementFacade.onAddNewPermissionsManagementRow(newPermission);
    }

    protected onEditPermissionsManagementRow(permission: Permission, permissionsManagementRow: PermissionsManagementRow) {
        this.permissionsManagementFacade.onEditPermissionsManagementRow({ ...permissionsManagementRow, permission });
    }

    protected filterPermissionsManagementRowsByIndividual($event: string) {
        this.permissionsManagementFacade.onSearchUserField($event);
    }

    protected filterPermissionsManagementRowsByGroup($event: string) {
        this.permissionsManagementFacade.onSearchGroupField($event);
    }

    protected searchGroups($event: string) {
        this.permissionsManagementFacade.onNewGroupField($event);
    }

    protected searchIndividuals($event: string) {
        this.permissionsManagementFacade.onNewUserField($event);
    }

    protected onInheritanceStateChange(isEnabled: boolean): void {
        this.permissionsManagementFacade.onUpdateInheritanceState(isEnabled);
    }

    private saveDocumentPermissions() {
        return this.permissionsManagementFacade.updateDocumentAcl();
    }

    protected restoreDocumentPermissions(restoreOption: UserType) {
        return this.permissionsManagementFacade.restorePermissionsToInherited(restoreOption);
    }
}
