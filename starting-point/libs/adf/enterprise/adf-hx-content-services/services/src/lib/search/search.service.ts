/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Query, QueryApi, QueryResult } from '@hylandsoftware/hxcs-js-client';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QUERY_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { SearchOptions } from './models/search-options.interface';
import { DEFAULT_PAGE_SIZE } from './configs/config';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    constructor(@Inject(QUERY_API_TOKEN) private queryApi: QueryApi) {}

    public getDocumentsByQuery(search: string, options?: SearchOptions): Observable<QueryResult> {
        const query: Query = {
            query: search,
            limit: options?.pagination?.maxItems || DEFAULT_PAGE_SIZE,
            offset: options?.pagination?.skipCount || 0,
            trackTotalCount: true,
            sort: options?.sort || [],
        };

        return from(this.queryApi.getDocumentsByQuery(query)).pipe(map(({ data }) => data));
    }

    public sanitizeQuery(query: string): string {
        const pattern = /(\*|%|'|"|\/|\+|_|-|\\)/g;

        return query.replace(pattern, (match) => `\\${match}`);
    }
}
