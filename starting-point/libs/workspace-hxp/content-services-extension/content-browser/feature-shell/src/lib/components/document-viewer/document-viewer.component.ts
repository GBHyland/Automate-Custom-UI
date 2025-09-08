/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Inject, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';
import { ToolbarDividerComponent, ToolbarTitleComponent } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';
import {
    DocumentService,
    ActionContext,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    RouterExtService,
    DocumentMoreMenuItemsFactoryService,
    PermissionsPanelRequestService,
    PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
    DocumentRouterService,
    ManageVersionsButtonActionService,
    ContextActionConfiguration,
    hasPermission,
    DocumentPermissions,
    isVersion,
} from '@alfresco/adf-hx-content-services/services';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import {
    ContentDeleteButtonComponent,
    ContentPropertiesViewerButtonComponent,
    ContentPropertyViewerActionService,
    ContentShareButtonComponent,
    DocumentMoreActionComponent,
    HxpBreadcrumbComponent,
    HxpPropertiesSidebarComponent,
    HxpUiDocumentViewerComponent,
    ManageVersionsSidebarComponent,
    PermissionsButtonActionService,
    PermissionsManagementPanelComponent,
    SingleItemDownloadButtonComponent,
    VersionDeleteButtonComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { DocumentVersionSelectorComponent } from '../document-version-selector/document-version-selector.component';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';

type PanelType = 'properties' | 'versions' | 'permissions';

@Component({
    selector: 'hxp-document-viewer',
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss'],
    providers: [
        {
            provide: PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
            useValue: 'panel',
        },
        {
            provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
            useClass: PermissionsButtonActionService,
        },
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        HxpUiDocumentViewerComponent,
        AsyncPipe,
        MatToolbarModule,
        ToolbarTitleComponent,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        HxpBreadcrumbComponent,
        HxpPropertiesSidebarComponent,
        ContentPropertiesViewerButtonComponent,
        ContentDeleteButtonComponent,
        SingleItemDownloadButtonComponent,
        ContentShareButtonComponent,
        ToolbarDividerComponent,
        DocumentMoreActionComponent,
        TranslatePipe,
        PermissionsManagementPanelComponent,
        DocumentVersionSelectorComponent,
        ManageVersionsSidebarComponent,
        VersionDeleteButtonComponent,
    ],
})
export class DocumentViewerComponent implements OnChanges {
    @Input() document!: Document;

    rightSidebarVisibility = false;
    rightSidebarPanelType: PanelType = 'properties';
    moreMenu$: Observable<ContentActionRef>;
    actionContext: ActionContext = { documents: [] };

    protected editablePropertiesSidebar = false;
    protected fullScreen = false;

    protected readonly featuresService = inject(FeaturesServiceToken);
    protected readonly applicationChromeFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_WORKSPACE_SATORI_APPLICATION_CHROME;

    private refererURL: string;

    constructor(
        private menuItemsFactoryService: DocumentMoreMenuItemsFactoryService,
        private routerExtService: RouterExtService,
        private permissionsPanelRequestService: PermissionsPanelRequestService,
        private documentService: DocumentService,
        private documentRouterService: DocumentRouterService,
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private contentPropertyViewerActionService: ContentPropertyViewerActionService,
        private manageVersionsButtonActionService: ManageVersionsButtonActionService
    ) {
        this.moreMenu$ = this.menuItemsFactoryService.getMoreMenuItems();
        this.refererURL = this.routerExtService.getPreviousUrl();
        this.permissionsPanelRequestService.notifications$.pipe(takeUntilDestroyed()).subscribe({
            next: (show) => {
                this.setRightSidebarPanel(show, 'permissions');
            },
        });

        this.documentService.documentUpdated$
            .pipe(
                filter(({ document }) => !!document && document.sys_id === this.document?.sys_id),
                takeUntilDestroyed()
            )
            .subscribe(({ document }) => {
                this.document = document;
                this.editablePropertiesSidebar = hasPermission(document, DocumentPermissions.READ_WRITE);
                this.updateActionContext();
                this.setRightSidebarPanel(this.rightSidebarVisibility, this.rightSidebarPanelType);
            });

        this.documentService.documentRestored$.pipe(takeUntilDestroyed()).subscribe({
            next: (restoredDocument) => {
                if (!isVersion(this.document)) {
                    this.document = restoredDocument;
                    this.updateActionContext();
                }
            },
        });

        this.contentPropertyViewerActionService.showPropertyPanel$.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe({
            next: (shouldShow) => this.setRightSidebarPanel(shouldShow, 'properties'),
            error: ({ error }) => console.error(error),
        });

        this.manageVersionsButtonActionService.showVersionsPanel$.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe({
            next: (shouldShow) => this.setRightSidebarPanel(shouldShow, 'versions'),
            error: (error) => console.error(error),
        });
    }

    ngOnChanges(): void {
        this.editablePropertiesSidebar = this.document ? hasPermission(this.document, DocumentPermissions.READ_WRITE) : false;
        this.updateActionContext();
    }

    enterFullScreen() {
        this.fullScreen = true;
    }

    onClose(): void {
        this.routerExtService.redirectToReferer(this.refererURL, this.documentRouterService.urlForParent(this.document));
    }

    closeRightSidebarPanel(panelType: PanelType): void {
        this.setRightSidebarPanel(false, panelType);
    }

    private setRightSidebarPanel(showPanel: boolean, panelType: PanelType): void {
        if (panelType !== 'permissions') {
            this.setRightSidebarActionContext(showPanel, panelType);
        }
        if (showPanel) {
            this.rightSidebarPanelType = panelType;
        }
        this.rightSidebarVisibility = showPanel;
    }

    protected onMenuItemClick(menuItem: ContextActionConfiguration) {
        if (menuItem?.model?.visible) {
            menuItem.subject.next(menuItem);
        }
    }

    private updateActionContext(): void {
        this.actionContext = {
            documents: this.document ? [this.document] : [],
            refererURL: this.refererURL,
            shouldRedirect: true,
        };
    }

    private setRightSidebarActionContext(showPanel: boolean, panelType: Omit<PanelType, 'permissions'>): void {
        this.actionContext =
            panelType === 'properties'
                ? { ...this.actionContext, showPanel: showPanel ? 'property' : undefined }
                : { ...this.actionContext, showPanel: showPanel ? 'version' : undefined };
        this.contentPropertyViewerActionService.execute(this.actionContext);
        this.manageVersionsButtonActionService.execute(this.actionContext);
    }
}
