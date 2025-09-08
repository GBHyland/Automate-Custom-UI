/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';
import { InfoDrawerContentDirective, InfoDrawerLayoutComponent } from '@alfresco/adf-core';
import {
    DocumentRouterService,
    DocumentVersionsService,
    EditDocumentVersion,
    HxpNotificationService,
    UserResolverPipe,
    VersionableDocument,
    ContextActionConfiguration,
} from '@alfresco/adf-hx-content-services/services';
import { VersionContextMenuActionsService } from './version-context-menu.service';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewEncapsulation,
    ContentChild,
    TemplateRef,
    ViewChild,
    OnInit,
    inject,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { finalize, map, merge, switchMap, take } from 'rxjs';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogConfig } from '../../../util/dialog/config';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditVersionDialogComponent } from '../edit-version-dialog/edit-version-dialog.component';
import { DeleteVersionDialogComponent } from '../delete-version-dialog/delete-version-dialog.component';
import { PanelSkeletonLoaderComponent } from '../../skeleton-loader/panel-skeleton-loader/panel-skeleton-loader.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';

@Component({
    selector: 'hxp-manage-versions-sidebar',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        TranslatePipe,
        UserResolverPipe,
        DatePipe,
        InfoDrawerLayoutComponent,
        InfoDrawerContentDirective,
        MatButtonModule,
        MatIconModule,
        PanelSkeletonLoaderComponent,
        MatMenuModule,
        MatTooltipModule,
        NgClass,
    ],
    templateUrl: './manage-versions-sidebar.component.html',
    styleUrls: ['./manage-versions-sidebar.component.scss'],
})
export class ManageVersionsSidebarComponent implements OnInit, OnChanges {
    /**
     * The document to display the versions for
     * @type {Document}
     */
    @Input() document?: Document;
    /**
     * Emits an event when the sidebar is closed
     */
    @Output() closeVersionsSidebar = new EventEmitter<void>();

    documentVersions: VersionableDocument[] = [];
    isLoading = false;
    protected workingCopy: VersionableDocument | undefined = undefined;
    protected selectedDocument: VersionableDocument | undefined = undefined;

    @ContentChild('contextActionMenu', { static: false })
    protected contextActionMenuTemplateRef: TemplateRef<any> | null = null;

    @ViewChild('trigger', { static: false })
    protected menuTrigger?: MatMenuTrigger;

    @ViewChild('hiddenTrigger', { static: false })
    protected hiddenTrigger!: MatMenuTrigger;

    protected contextMenuPosition = { x: '0px', y: '0px' };
    protected contextActions: ContextActionConfiguration[] = [];
    protected isNewContextMenu = false;

    private featuresService = inject<IFeaturesService>(FeaturesServiceToken);

    constructor(
        private documentRouterService: DocumentRouterService,
        private documentVersionsService: DocumentVersionsService,
        private hxpNotificationService: HxpNotificationService,
        private dialog: MatDialog,
        private versionContextMenuActionsService: VersionContextMenuActionsService
    ) {}

    ngOnInit() {
        this.featuresService.isOn$(ADF_HX_CONTENT_SERVICES_INTERNAL.VERSIONING_NEW_CONTEXT_MENU).subscribe((isOn) => {
            this.isNewContextMenu = isOn;
        });

        merge(this.documentVersionsService.versionDeleted$, this.documentVersionsService.versionUpdated$).subscribe(() => {
            this.loadVersions();
        });
    }

    ngOnChanges() {
        if (this.document) {
            this.selectedDocument = this.document;
            this.loadVersions();
        }
    }

    redirectToVersion(document: Document): void {
        if (document) {
            this.selectedDocument = document;
            this.documentRouterService.navigateTo(document);
        }
    }

    openEditVersionDialog(version: VersionableDocument): void {
        const editDialogRef = this.dialog.open<EditVersionDialogComponent, VersionableDocument>(EditVersionDialogComponent, {
            width: DialogConfig.small.width,
            data: version,
        });

        editDialogRef.componentInstance.versionUpdated$.pipe(take(1)).subscribe((updatedVersion) => {
            this.updateVersion(updatedVersion, editDialogRef);
        });
    }

    openDeleteVersionDialog(version: VersionableDocument): void {
        const deleteDialogRef = this.dialog.open<DeleteVersionDialogComponent, VersionableDocument>(DeleteVersionDialogComponent, {
            width: DialogConfig.small.width,
            data: version,
        });

        deleteDialogRef.componentInstance.versionDeleted$.pipe(take(1)).subscribe((status) => {
            if (status) {
                this.deleteVersion(version, deleteDialogRef);
            }
        });
    }

    protected onClose(): void {
        this.closeVersionsSidebar.emit();
    }

    protected onContextMenu(event: MouseEvent, version: VersionableDocument): void {
        event.preventDefault();
        event.stopPropagation();

        this.contextMenuPosition = { x: `${event.clientX}px`, y: `${event.clientY}px` };

        const targetHtmlElement = event.target as HTMLElement;

        if (targetHtmlElement.tagName !== 'BUTTON' && targetHtmlElement.tagName !== 'MAT-ICON') {
            const node = targetHtmlElement.closest('.hxp-version-item');
            const trigger = node?.querySelector('.hxp-menu-trigger');

            this.contextActions = this.getContextActions(version);
            if (this.contextActions.some((action) => action.model.visible)) {
                trigger?.dispatchEvent(new MouseEvent('click'));
            }
        } else {
            this.contextActions = this.getContextActions(version);
            if (this.contextActions.some((action) => action.model.visible)) {
                this.hiddenTrigger?.openMenu();
            }
        }
    }

    private getContextActions(version: VersionableDocument) {
        return this.versionContextMenuActionsService.getVersionContextActions(version, this.workingCopy);
    }

    private loadVersions() {
        if (!this.selectedDocument) {
            return;
        }
        this.isLoading = true;
        this.documentVersionsService
            .getCurrentDocument(this.selectedDocument)
            .pipe(
                take(1),
                switchMap((currentDoc) => {
                    this.workingCopy = currentDoc;
                    return this.documentVersionsService
                        .getVersions(currentDoc)
                        .pipe(map((versions: VersionableDocument[]) => [currentDoc, ...versions]));
                }),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: (mergedVersions: VersionableDocument[]) => {
                    this.documentVersions = mergedVersions;
                },
                error: (err) => {
                    console.error(err);
                },
            });
    }

    private updateVersion(updatedVersion: EditDocumentVersion, editDialogRef: MatDialogRef<EditVersionDialogComponent>): void {
        if (!updatedVersion?.sys_id) {
            return;
        }

        this.documentVersionsService
            .updateVersion(updatedVersion)
            .pipe(finalize(() => (editDialogRef.componentInstance.isUpdating = false)))
            .subscribe({
                next: () => {
                    editDialogRef.close();
                    this.loadVersions();
                    this.hxpNotificationService.showSuccess('MANAGE_VERSIONS.EDIT_DIALOG.NOTIFICATION.SUCCESS');
                },
                error: (error) => {
                    console.error(error);
                    this.hxpNotificationService.showError('MANAGE_VERSIONS.EDIT_DIALOG.NOTIFICATION.ERROR');
                },
            });
    }

    private deleteVersion(version: VersionableDocument, deleteDialogRef: MatDialogRef<DeleteVersionDialogComponent>): void {
        if (!version.sys_id) {
            return;
        }

        this.documentVersionsService
            .deleteVersion(version)
            .pipe(finalize(() => (deleteDialogRef.componentInstance.isDeleting = false)))
            .subscribe({
                next: () => {
                    deleteDialogRef.close();
                    this.loadVersions();
                    this.hxpNotificationService.showSuccess('MANAGE_VERSIONS.DELETE_DIALOG.NOTIFICATION.SUCCESS');
                    if (version.sys_id === this.selectedDocument?.sys_id) {
                        this.redirectToVersion(this.workingCopy as VersionableDocument);
                    }
                },
                error: (error) => {
                    console.error(error);
                    this.hxpNotificationService.showError('MANAGE_VERSIONS.DELETE_DIALOG.NOTIFICATION.ERROR');
                },
            });
    }
}
