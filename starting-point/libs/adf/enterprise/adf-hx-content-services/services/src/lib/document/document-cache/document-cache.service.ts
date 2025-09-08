/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { DocumentService } from '../document.service';

@Injectable({
    providedIn: 'root',
})
export class DocumentCacheService {
    private documentCache: Map<string, Observable<Document>> = new Map();

    constructor(private documentService: DocumentService) {
        this.documentService.documentUpdated$.subscribe({
            next: ({ document }) => {
                if (document && document.sys_id) {
                    this.invalidate(document.sys_id);
                }
            },
            error: (error) => console.error(error),
        });
    }

    getDocumentCache(): Map<string, Observable<Document>> {
        return this.documentCache;
    }

    getDocument(documentId: string): Observable<Document> {
        return this.documentCache.get(documentId) ?? this.fetchDocument(documentId);
    }

    invalidate(documentId: string) {
        this.documentCache.delete(documentId);
    }

    private fetchDocument(documentId: string): Observable<Document> {
        const cachedResult$ = this.documentService.getDocumentById(documentId)?.pipe(shareReplay(1));

        this.documentCache.set(documentId, cachedResult$);

        return cachedResult$;
    }
}
