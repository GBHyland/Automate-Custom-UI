/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { DocumentService, DocumentRouterService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { filter, map, startWith } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { FolderIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const CONTENT_BROWSER_ROUTE = '/documents';

@Component({
    standalone: true,
    selector: 'hxp-sidenav',
    templateUrl: './hxp-sidenav.component.html',
    styleUrls: ['./hxp-sidenav.component.scss'],
    imports: [NgIf, TranslatePipe, MatExpansionModule, MatButtonModule, HxpWorkspaceDocumentTreeComponent, FolderIconComponent],
})
export class HxpSidenavComponent implements OnInit {
    @Input()
    data: any;

    protected document: Document | undefined;
    protected isSideNavExpanded: boolean;

    private readonly destroyRef = inject(DestroyRef);
    private isContentBrowserRouteActive = false;

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private documentService: DocumentService,
        private router: Router,
        private documentRouterService: DocumentRouterService,
        private sidenavExpansionService: SidenavExpansionService
    ) {
        this.isSideNavExpanded = this.sidenavExpansionService.isSideNavExpanded();
    }

    ngOnInit(): void {
        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((url) => {
                this.isContentBrowserRouteActive = !!url?.includes(CONTENT_BROWSER_ROUTE);
                if (!this.isContentBrowserRouteActive) {
                    this.document = null;
                }
                this.cdRef.detectChanges();
            });

        this.documentService.documentLoaded$
            .pipe(
                filter((doc) => !!doc),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((document) => {
                this.document = document;
            });
    }

    isExpanded(): boolean {
        return this.data?.state === 'expanded';
    }

    navigateToRoot(): void {
        this.documentRouterService.navigateTo(ROOT_DOCUMENT);
    }

    navigateToDocument(document: Document): void {
        this.documentRouterService.navigateTo(document);
    }
}
