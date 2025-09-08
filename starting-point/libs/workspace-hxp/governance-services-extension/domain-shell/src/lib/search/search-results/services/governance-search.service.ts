/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { expand, filter, map, switchMap, take, takeWhile, tap } from 'rxjs/operators';
import { GovernanceRecord } from '../../../mocks/record.type';
import { GovernanceSearchOptions } from '../../models/search-options.interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from '../../../config/governance-discovery.service';
import { GovernanceSearchResult } from './governance-search-result.interface';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { GovernanceConfigModel } from '../../../config/governance-config.type';
import { DEFAULT_GOVERNANCE_SEARCH_LIMIT } from './governance-search.constants';
@Injectable({
    providedIn: 'root',
})
export class GovernanceSearchService {
    private jwtHelperService: JwtHelperService = inject(JwtHelperService);
    private http: HttpClient = inject(HttpClient);
    private governanceDiscoveryService = inject(GovernanceDiscoveryService);
    private governanceConfigurationService = inject(GovernanceConfigurationService);
    private nextPageCache: {
        query: Record<string, any>;
        options: GovernanceSearchOptions;
        cachedRecords: GovernanceRecord[];
        lastEvaluatedKey?: string;
    } | null = null;

    private readonly queryApiPath = '/api/records/query';

    /**
     * Clears any stored cache and resets test call counter
     */
    public clearCache(): void {
        this.nextPageCache = null;
    }

    /**
     * Executes a paginated search. Uses cache for next page if available,
     * otherwise fetches from server with recursive expansion if needed.
     */
    public search(query: Record<string, any>, options?: GovernanceSearchOptions): Observable<GovernanceSearchResult> {
        const requestedLimit = options?.limit || DEFAULT_GOVERNANCE_SEARCH_LIMIT;

        // SITUATION 1: We have cached results that match this request
        if (options?.exclusiveStartKey && this.hasCachedNextPage(query, options)) {
            const pageSize = requestedLimit;
            const cachedRecords = this.nextPageCache?.cachedRecords || [];
            const serverLastEvaluatedKey = this.nextPageCache?.lastEvaluatedKey;
            this.nextPageCache = null;

            // SITUATION 2: Not enough data in the cache, fetch more from server
            if (cachedRecords.length < pageSize && serverLastEvaluatedKey) {
                const serverOptions = { ...options, exclusiveStartKey: serverLastEvaluatedKey, limit: pageSize };

                return this.fetchPage(query, serverOptions).pipe(
                    switchMap((serverResult) => {
                        return this.combinePageResultAsync(
                            query,
                            options,
                            cachedRecords,
                            serverResult.content,
                            pageSize,
                            serverResult.lastEvaluatedKey
                        ).pipe(
                            switchMap((intermediateResult) => {
                                // Only fetch more if result is less than pageSize and lastEvaluatedKey is present
                                if (intermediateResult.content.length < pageSize && serverResult.lastEvaluatedKey) {
                                    const nextOptions = { ...options, exclusiveStartKey: serverResult.lastEvaluatedKey, limit: pageSize };
                                    return this.fetchPage(query, nextOptions).pipe(
                                        map((additionalResult) =>
                                            this.combinePageResultSync(
                                                query,
                                                options,
                                                [...cachedRecords, ...(serverResult.content || [])],
                                                additionalResult.content,
                                                pageSize,
                                                additionalResult.lastEvaluatedKey
                                            )
                                        )
                                    );
                                }
                                return of(intermediateResult);
                            })
                        );
                    }),
                    take(1) // Ensure observable completes after emission
                );
            }

            // SITUATION 3: We have enough cached data to return a page
            const lastVisibleKey = serverLastEvaluatedKey;
            return of({ content: cachedRecords, lastEvaluatedKey: lastVisibleKey ?? '' });
        }

        // SITUATION 4: No cached data, start from scratch with server fetch
        const modifiedOptions = { ...options };

        return this.fetchPage(query, modifiedOptions).pipe(
            expand((result) => {
                if (!result?.content) return of(null);

                // Only fetch more if result is less than requestedLimit and lastEvaluatedKey is present
                if (result.content.length < requestedLimit && result.lastEvaluatedKey) {
                    const nextOptions = { ...modifiedOptions, limit: requestedLimit, exclusiveStartKey: result.lastEvaluatedKey };

                    return this.fetchPage(query, nextOptions).pipe(
                        map((nextResult) =>
                            this.combinePageResultSync(
                                query,
                                nextOptions,
                                result.content,
                                nextResult.content,
                                requestedLimit,
                                nextResult.lastEvaluatedKey
                            )
                        )
                    );
                }

                return of(null); // No more expansion needed
            }),
            // Stop when we hit enough data or no more data to fetch
            takeWhile((result) => {
                const combinedCount = (this.nextPageCache?.cachedRecords?.length || 0) + (result?.content?.length || 0);
                return combinedCount < requestedLimit && !!result?.lastEvaluatedKey;
            }, true),
            filter((result) => !!result),
            tap((result) => {
                // Cache setup for potential next page request
                if (!this.nextPageCache && result.lastEvaluatedKey) {
                    // First, update the lastEvaluatedKey to be from the last visible record

                    this.nextPageCache = {
                        query,
                        options: options || {},
                        cachedRecords: [],
                        lastEvaluatedKey: result.lastEvaluatedKey,
                    };
                }
            })
        );
    }

    /**
     * Async, combines records from cached with additional records from the server and caches the excess for next page
     */
    private combinePageResultAsync(
        query: Record<string, any>,
        options: GovernanceSearchOptions,
        baseRecords: GovernanceRecord[],
        additionalRecords: GovernanceRecord[] = [],
        pageSize: number,
        lastEvaluatedKey: string
    ): Observable<GovernanceSearchResult> {
        const combined = [...baseRecords, ...additionalRecords];
        const pageRecords = combined.slice(0, pageSize);
        const excess = combined.slice(pageSize);

        if (excess.length > 0) {
            this.nextPageCache = {
                query,
                options,
                cachedRecords: excess,
                lastEvaluatedKey: lastEvaluatedKey,
            };
        }

        return of({ content: pageRecords, lastEvaluatedKey: lastEvaluatedKey });
    }

    /**
     * The same as combinePageResultAsync but synchronous.
     */
    private combinePageResultSync(
        query: Record<string, any>,
        options: GovernanceSearchOptions,
        baseRecords: GovernanceRecord[],
        additionalRecords: GovernanceRecord[] = [],
        pageSize: number,
        lastEvaluatedKey: string
    ): GovernanceSearchResult {
        const combined = [...baseRecords, ...additionalRecords];
        const pageRecords = combined.slice(0, pageSize);
        const excess = combined.slice(pageSize);

        if (excess.length > 0) {
            this.nextPageCache = {
                query,
                options,
                cachedRecords: excess,
                lastEvaluatedKey: lastEvaluatedKey,
            };
        }

        return { content: pageRecords, lastEvaluatedKey: lastEvaluatedKey };
    }

    /**
     * Mocked backend query to return paginated, filtered, and sorted results
     */
    private fetchPage(query: Record<string, any>, options?: GovernanceSearchOptions): Observable<GovernanceSearchResult> {
        const accessToken = this.jwtHelperService.getAccessToken();

        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey }) => {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });

                // Helper to build params and execute the HTTP request
                const executeSearch = (finalQuery: Record<string, any>) => {
                    let params = new HttpParams();
                    for (const key in finalQuery) {
                        if (Object.prototype.hasOwnProperty.call(finalQuery, key)) {
                            const value = finalQuery[key];
                            params = params.set(key, Array.isArray(value) ? value.join(',') : value);
                        }
                    }

                    if (options?.exclusiveStartKey) {
                        params = params.set('exclusiveStartKey', options.exclusiveStartKey);
                    }

                    if (options?.limit) {
                        params = params.set('limit', options.limit.toString());
                    }

                    return this.http.get<GovernanceSearchResult>(`${govUrl}${this.queryApiPath}`, { headers, params });
                };

                // Workaround for the current implementation. Right now EDS needs to be selected otherwise we get 500 from the API. This will be changed in Beta version
                // If 'eds' is not set, fetch config and set it before making the request
                if (!query['eds']) {
                    return this.governanceConfigurationService.getConfig().pipe(
                        take(1),
                        switchMap((config: GovernanceConfigModel) => {
                            if (config.dataSources && config.dataSources.length > 0) {
                                const defaultDataSource = config.dataSources[0];
                                const newQuery = { ...query, eds: defaultDataSource.id };
                                return executeSearch(newQuery);
                            } else {
                                console.warn('No default data source configured, governance search may not return expected results.');
                                return executeSearch(query);
                            }
                        })
                    );
                }

                // If 'eds' is already set, proceed directly
                return executeSearch(query);
            })
        );
    }

    /**
     * Verifies whether the next page cache matches current request params
     */
    private hasCachedNextPage(query: Record<string, any>, options?: GovernanceSearchOptions): boolean {
        const cache = this.nextPageCache;
        if (!cache || !cache.cachedRecords?.length) return false;

        const isQueryMatch = JSON.stringify(cache.query) === JSON.stringify(query);
        const isLimitMatch = options?.limit === cache.options?.limit;
        const isKeyMatch = options?.exclusiveStartKey === cache.lastEvaluatedKey;

        return isQueryMatch && isLimitMatch && (!options?.exclusiveStartKey || isKeyMatch);
    }
}
