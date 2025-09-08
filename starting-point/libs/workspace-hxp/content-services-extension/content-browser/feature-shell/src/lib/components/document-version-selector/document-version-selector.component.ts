/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    ActionContext,
    DocumentService,
    DocumentRouterService,
    DocumentVersionsService,
    isVersionable,
} from '@alfresco/adf-hx-content-services/services';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { catchError, filter, finalize, map, merge, Observable, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-document-version-selector',
    standalone: true,
    templateUrl: './document-version-selector.component.html',
    styleUrls: ['./document-version-selector.component.scss'],
    imports: [FeaturesDirective, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, DatePipe, FormsModule, MatChipsModule, TranslatePipe],
    encapsulation: ViewEncapsulation.None,
})
export class DocumentVersionSelectorComponent implements OnChanges {
    private documentService = inject(DocumentService);
    private documentVersionsService = inject(DocumentVersionsService);
    private documentRouterService = inject(DocumentRouterService);

    @Input() actionContext: ActionContext = { documents: [] };

    protected documentVersions: Document[] = [];
    protected isLoading = false;
    protected isVersionable = false;
    protected selectedDocument: Document | undefined = undefined;
    protected versioningFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.WORKSPACE_VERSIONING;
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        merge(
            this.documentService.documentUpdated$.pipe(
                filter(({ document }) => !!document),
                map(({ document }) => document.sys_id)
            ),
            this.documentService.documentDeleted$
        )
            .pipe(
                filter((documentId) => this.documentVersions?.some((doc) => doc.sys_id === documentId)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => this.fetchVersions(),
            });
    }

    ngOnChanges(): void {
        if (!this.hasDocument()) {
            this.selectedDocument = undefined;
            this.isVersionable = false;
            return;
        }

        this.selectedDocument = this.actionContext.documents[0];
        this.isVersionable = isVersionable(this.selectedDocument);
        if (this.isVersionable) {
            this.fetchVersions();
        }
    }

    get versions(): Document[] {
        return this.documentVersions;
    }

    protected onVersionSelected(event: MatSelectChange): void {
        const document: Document = event.value as Document;
        if (document) {
            this.documentRouterService.navigateTo(document);
        }
    }

    protected compareDocuments(document1: Document, document2: Document): boolean {
        return document1.sys_id === document2.sys_id;
    }

    private hasDocument(): boolean {
        return this.actionContext?.documents?.length > 0;
    }

    private isWorkingCopy(document: Document): boolean {
        return !document.sysver_isVersion;
    }

    private fetchVersions(): void {
        if (!this.selectedDocument) {
            return;
        }

        this.isLoading = true;
        this.getDocumentVersions()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (versions) => (this.documentVersions = versions),
                error: () => {
                    console.error(`Failed to fetch versions for document: ${this.selectedDocument?.sys_id}`);
                    this.documentVersions = [this.selectedDocument];
                },
            });
    }

    private getDocumentVersions(): Observable<Document[]> {
        if (this.isWorkingCopy(this.selectedDocument)) {
            return this.documentVersionsService.getVersions(this.selectedDocument).pipe(map((versions) => [this.selectedDocument, ...versions]));
        }

        return this.documentService.getDocumentById(this.selectedDocument.sys_parentId).pipe(
            switchMap((workingCopy) => this.documentVersionsService.getVersions(workingCopy).pipe(map((versions) => ({ workingCopy, versions })))),
            map(({ workingCopy, versions }) => [workingCopy, ...versions]),
            catchError(() => {
                console.error(`Failed to fetch working copy for document: ${this.selectedDocument.sys_id}`);
                return of([this.selectedDocument]);
            })
        );
    }
}
