/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, DestroyRef, inject, Inject, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { of, merge } from 'rxjs';
import { catchError, map, switchMap, finalize, debounceTime, filter } from 'rxjs/operators';
import { DEFAULT_REPOSITORY_ID, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
    DocumentService,
    HxpNotificationService,
    hasPermission,
    ActionContext,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    DocumentPermissions,
    DocumentRouterService,
    ManageVersionsButtonActionService,
    ContextActionConfiguration,
    PermissionLevelPipe,
    DateTimeFormatPipe,
    UserResolverPipe,
} from '@alfresco/adf-hx-content-services/services';
import { PaginationOptions, PageSizeStorageService } from '@hxp/workspace-hxp/content-services-extension/shared/util';
import {
    ContentPropertyViewerActionService,
    ContentTypeIconComponent,
    HxpBreadcrumbComponent,
    HxpPropertiesSidebarComponent,
    ManageVersionsSidebarComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { ContentRepositoryComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/feature-shell';
import { AsyncPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IsFolderishDocumentPipe } from './is-folderish-document.pipe';
import { HxPCreateDocumentButtonComponent } from '../document-create/create-document-button/create-document-button.component';
import { DataColumnComponent, DataColumnListComponent, FileSizePipe } from '@alfresco/adf-core';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';
import { UploadSnackbarComponent } from '../document-create/upload/upload-snackbar/snackbar/upload-snackbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'hxp-content-browser',
    templateUrl: './hxp-content-browser.component.html',
    styleUrls: ['./hxp-content-browser.component.scss'],
    imports: [
        NgClass,
        AsyncPipe,
        TranslatePipe,
        PermissionLevelPipe,
        IsFolderishDocumentPipe,
        HxpBreadcrumbComponent,
        HxPCreateDocumentButtonComponent,
        ContentRepositoryComponent,
        DataColumnComponent,
        DataColumnListComponent,
        ContentTypeIconComponent,
        FileSizePipe,
        DateTimeFormatPipe,
        UserResolverPipe,
        MatPaginatorModule,
        MatIconModule,
        MatMenuModule,
        DocumentViewerComponent,
        HxpPropertiesSidebarComponent,
        UploadSnackbarComponent,
        ManageVersionsSidebarComponent,
    ],
})
export class ContentBrowserComponent implements OnInit, OnChanges {
    public documents: Document[] = [];
    public actionContext: ActionContext = { documents: [] };
    selectedFolderId$ = this.route.url.pipe(map((urlSegments = []) => (urlSegments.length > 0 ? urlSegments[0].path : '')));

    protected isLoading = false;
    protected selection: Document[] = [];
    protected document!: Document;
    protected isCreateDisabled: true | undefined = true;
    protected paginatorConfig = {
        offset: 0,
        totalCount: 0,
        pageSizeOptions: PaginationOptions,
    };
    protected pageSize: number;
    protected repositoryId: string = DEFAULT_REPOSITORY_ID;
    protected editablePropertiesSidebar = false;

    private readonly destroyRef = inject(DestroyRef);
    private activeSortingOptions: Array<string> = [];

    constructor(
        private documentService: DocumentService,
        private route: ActivatedRoute,
        private documentRouterService: DocumentRouterService,
        private changeDetectorRef: ChangeDetectorRef,
        private hxpNotificationService: HxpNotificationService,
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private contentPropertyViewerActionService: ContentPropertyViewerActionService,
        private pageSizeStorageService: PageSizeStorageService,
        private manageVersionsButtonActionService: ManageVersionsButtonActionService
    ) {
        this.subscribeToShowPropertyPanelStatus();
        this.subscribeToShowVersionsPanelStatus();
        this.subscribeToDocumentUpdates();
    }

    ngOnInit() {
        this.pageSize = this.pageSizeStorageService.getSize();

        this.route.params
            .pipe(
                switchMap((params) => {
                    this.repositoryId = params['repositoryId'] || DEFAULT_REPOSITORY_ID;
                    const docId = params['id'] || ROOT_DOCUMENT.sys_id;
                    this.documentService.setCurrentRepository(this.repositoryId);
                    return this.documentService.getDocumentById(docId, this.repositoryId).pipe(
                        catchError((error) => {
                            if (error.response.status === 403 && docId === ROOT_DOCUMENT.sys_id) {
                                return of(ROOT_DOCUMENT);
                            }
                            throw error;
                        })
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (doc) => {
                    this.document = doc;
                    this.resetPaginatorConfig();
                    this.fetchChildren();
                    this.checkCreatePermission();
                    this.documentService.notifyDocumentLoaded(this.document);
                    this.changeDetectorRef.detectChanges();
                },
                error: ({ response }) => {
                    this.hxpNotificationService.showError(
                        [401, 403].includes(response.status)
                            ? 'CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.' + response.status
                            : 'CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.DEFAULT'
                    );
                },
            });

        merge(this.documentService.documentCreated$, this.documentService.documentDeleted$, this.documentService.documentRequestReload$)
            .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.documentService.clearSelectionDocumentList();
                this.fetchChildren();
            });
    }

    ngOnChanges(): void {
        this.checkCreatePermission();
        this.resetPaginatorConfig();
    }

    handleCloseSidebarPanel(): void {
        if (this.actionContext.showPanel === 'property') {
            this.actionContext = { ...this.actionContext, showPanel: undefined };
            this.contentPropertyViewerActionService.execute(this.actionContext);
        }

        if (this.actionContext.showPanel === 'version') {
            this.actionContext = { ...this.actionContext, showPanel: undefined };
            this.manageVersionsButtonActionService.execute(this.actionContext);
        }
    }

    fetchChildren(sortOptions: string[] = []) {
        this.isLoading = true;
        this.documentService
            .getAllChildren(this.document.sys_id, {
                limit: this.pageSize,
                offset: this.paginatorConfig.offset,
                sort: sortOptions,
            })
            .pipe(
                catchError(() =>
                    of({
                        documents: [],
                        limit: 0,
                        offset: 0,
                        totalCount: 0,
                    })
                ),
                takeUntilDestroyed(this.destroyRef),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: (result) => {
                    this.documents = result.documents;
                    this.paginatorConfig.totalCount = result.totalCount;
                },
                error: (error) => {
                    console.error(error);
                },
            });
    }

    handlePageEvent(page: PageEvent) {
        this.pageSize = page.pageSize;
        this.pageSizeStorageService.setSize(page.pageSize);
        this.paginatorConfig.offset = page.pageIndex * page.pageSize;
        this.fetchChildren(this.activeSortingOptions);
        this.documentService.clearSelectionDocumentList();
    }

    protected handleRowClicked(document: Document) {
        this.documentRouterService.navigateTo(document);
    }

    protected handleSortingClicked(options: string[]) {
        this.activeSortingOptions = options;
        this.fetchChildren(this.activeSortingOptions);
    }

    protected handleCurrentSelection(documents: Document[]) {
        this.selection = documents;
        this.editablePropertiesSidebar = this.selection.length > 0 ? hasPermission(this.selection[0], DocumentPermissions.READ_WRITE) : false;
        this.actionContext = {
            ...this.actionContext,
            parentDocument: this.document,
            documents: this.selection,
        };
    }

    protected onMenuItemClick(menuItem: ContextActionConfiguration) {
        if (menuItem?.model?.visible) {
            menuItem.subject.next(menuItem);
        }
    }

    private resetPaginatorConfig() {
        this.paginatorConfig.offset = 0;
    }

    private checkCreatePermission() {
        if (this.document) {
            // if the user can upload a document, the disabled property of the upload component needs to be undefined instead of true
            this.isCreateDisabled = hasPermission(this.document, DocumentPermissions.CREATE_CHILD) ? undefined : true;
        }
    }

    private subscribeToShowPropertyPanelStatus(): void {
        this.contentPropertyViewerActionService.showPropertyPanel$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (status) => {
                this.actionContext = { ...this.actionContext, showPanel: status ? 'property' : undefined };
            },
            error: (error) => console.error(error),
        });
    }

    private subscribeToShowVersionsPanelStatus(): void {
        this.manageVersionsButtonActionService.showVersionsPanel$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (status) => {
                this.actionContext = { ...this.actionContext, showPanel: status ? 'version' : undefined };
            },
            error: (error) => console.error(error),
        });
    }

    private subscribeToDocumentUpdates(): void {
        this.documentService.documentUpdated$
            .pipe(
                filter(({ document }) => !!document && document?.sys_parentId === this.document?.sys_id),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.fetchChildren();
                },
                error: (error) => console.error(error),
            });
    }
}
