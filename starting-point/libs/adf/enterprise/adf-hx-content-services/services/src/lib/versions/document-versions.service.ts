/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { SearchService } from '../search/search.service';
import { EditDocumentVersion, VersionableDocument } from '../manage-versions/models/extended-document.interface';
import { DocumentService } from '../document/document.service';

@Injectable({
    providedIn: 'root',
})
export class DocumentVersionsService {
    versionDeleted$: Observable<void>;
    versionUpdated$: Observable<void>;

    protected versionDeletedSubject: Subject<void> = new Subject();
    protected versionUpdatedSubject: Subject<void> = new Subject();

    private searchService: SearchService = inject(SearchService);
    private documentService: DocumentService = inject(DocumentService);

    constructor() {
        this.versionDeleted$ = this.versionDeletedSubject.asObservable();
        this.versionUpdated$ = this.versionUpdatedSubject.asObservable();
    }

    getVersions(document: Document): Observable<Document[]> {
        return document?.sys_id ? this.getVersionsById(document.sys_id) : of([]);
    }

    getCurrentDocument(document: VersionableDocument): Observable<Document> {
        return document.sysver_isVersion ? this.documentService.getDocumentById(document.sys_parentId || '') : of(document);
    }

    updateVersion(updatePayload: EditDocumentVersion): Observable<boolean> {
        if (!updatePayload.sys_id) {
            return of(false);
        }

        return this.documentService.updateDocument(updatePayload.sys_id, updatePayload).pipe(
            map(() => true),
            tap(() => this.versionUpdatedSubject.next())
        );
    }

    deleteVersion(document: VersionableDocument): Observable<boolean> {
        if (!document.sys_id) {
            return of(false);
        }

        return this.documentService.deleteDocument(document.sys_id).pipe(
            map(() => true),
            tap(() => this.versionDeletedSubject.next())
        );
    }

    private getVersionsById(documentId: string): Observable<Document[]> {
        const query = this.buildQuery(documentId);
        return this.searchService.getDocumentsByQuery(query).pipe(map(({ documents }) => documents || []));
    }

    private buildQuery(documentId: string): string {
        return `SELECT * FROM SysContent WHERE sys_parentId = '${documentId}' AND sysver_isVersion = 1 ORDER BY sysver_created DESC`;
    }
}
