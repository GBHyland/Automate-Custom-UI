/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { RenditionsApi, Document, Rendition } from '@hylandsoftware/hxcs-js-client';
import { DEFAULT_REPOSITORY_ID, RENDITIONS_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RenditionsService {
    constructor(@Inject(RENDITIONS_API_TOKEN) protected renditionsApi: RenditionsApi) {}

    getRendition(documentId: string, renditionId: string, repositoryId: string = DEFAULT_REPOSITORY_ID): Observable<Document> {
        return from(this.renditionsApi.getRendition(documentId, renditionId, repositoryId)).pipe(map(({ data }) => data));
    }

    requestRenditionCreation(documentId: string, sysrendition_id: string, repositoryId: string = DEFAULT_REPOSITORY_ID): Observable<Document> {
        const rendition: Rendition = { sysrendition_id };

        return from(this.renditionsApi.createRendition(documentId, repositoryId, rendition)).pipe(map(({ data }) => data));
    }

    listRenditions(documentId: string, repositoryId: string = DEFAULT_REPOSITORY_ID): Observable<Document[]> {
        return from(this.renditionsApi.getRenditions(documentId, repositoryId)).pipe(map(({ data }) => data));
    }
}
