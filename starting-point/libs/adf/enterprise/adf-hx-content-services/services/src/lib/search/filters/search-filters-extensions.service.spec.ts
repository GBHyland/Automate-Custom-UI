/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { SearchFiltersExtensionsService, SearchFiltersRef } from './search-filters-extensions.service';
import { take } from 'rxjs/operators';
import { ExtensionConfig, ExtensionService } from '@alfresco/adf-extensions';
import { of } from 'rxjs';

const EXTENSION_CONFIG_WITH_FEATURE_FLAG = {
    features: {
        search: {
            filters: {
                id: 'app.search.filters',
                items: [
                    {
                        id: 'app.search.filters.filter1',
                        component: 'workspace-hxp-search-filter.filter1',
                        rules: {
                            featureFlag: 'filter1',
                        },
                    },
                    {
                        id: 'app.search.filters.filter2',
                        component: 'workspace-hxp-search-filter.filter2',
                    },
                    {
                        id: 'app.search.filters.filter3',
                        component: 'workspace-hxp-search-filter.filter3',
                    },
                ],
            },
        },
    },
};

const EXTENSION_CONFIG_WITHOUT_FEATURE_FLAG = {
    features: {
        search: {
            filters: {
                id: 'app.search.filters',
                items: [
                    {
                        id: 'app.search.filters.filter1',
                        component: 'workspace-hxp-search-filter.filter1',
                    },
                    {
                        id: 'app.search.filters.filter2',
                        component: 'workspace-hxp-search-filter.filter2',
                    },
                    {
                        id: 'app.search.filters.filter3',
                        component: 'workspace-hxp-search-filter.filter3',
                    },
                ],
            },
        },
    },
};

describe('SearchFiltersExtensionsService', () => {
    let extensionService;
    let service: any;

    const configureTestingModule = (extensions: ExtensionConfig, featureFlags: { [key: string]: boolean } = {}) => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [provideMockFeatureFlags(featureFlags), SearchFiltersExtensionsService],
        });
        extensionService = TestBed.inject(ExtensionService);
        extensionService.setup$ = of(extensions);
        service = TestBed.inject(SearchFiltersExtensionsService);
    };
    describe('with no feature flag rule', () => {
        beforeEach(() => {
            configureTestingModule(EXTENSION_CONFIG_WITHOUT_FEATURE_FLAG as unknown as ExtensionConfig);
        });

        it('should return all search items', async () => {
            const services: SearchFiltersRef = await service.getSearchFiltersItems().pipe(take(1)).toPromise();
            expect(services).toEqual({
                id: 'app.search.filters',
                items: [
                    {
                        id: 'app.search.filters.filter1',
                        component: 'workspace-hxp-search-filter.filter1',
                    },
                    {
                        id: 'app.search.filters.filter2',
                        component: 'workspace-hxp-search-filter.filter2',
                    },
                    {
                        id: 'app.search.filters.filter3',
                        component: 'workspace-hxp-search-filter.filter3',
                    },
                ],
            });
        });
    });

    describe('with a feature flag enabled', () => {
        beforeEach(() => {
            configureTestingModule(EXTENSION_CONFIG_WITH_FEATURE_FLAG as unknown as ExtensionConfig, { filter1: true });
        });

        it('should return all search items', async () => {
            const services: SearchFiltersRef = await service.getSearchFiltersItems().pipe(take(1)).toPromise();
            expect(services).toEqual({
                id: 'app.search.filters',
                items: [
                    {
                        id: 'app.search.filters.filter1',
                        component: 'workspace-hxp-search-filter.filter1',
                        rules: {
                            featureFlag: 'filter1',
                        },
                    },
                    {
                        id: 'app.search.filters.filter2',
                        component: 'workspace-hxp-search-filter.filter2',
                    },
                    {
                        id: 'app.search.filters.filter3',
                        component: 'workspace-hxp-search-filter.filter3',
                    },
                ],
            });
        });
    });

    describe('with a feature flag disabled', () => {
        beforeEach(() => {
            configureTestingModule(EXTENSION_CONFIG_WITH_FEATURE_FLAG as unknown as ExtensionConfig, { filter1: false });
        });

        it('should return all search items', async () => {
            const services: SearchFiltersRef = await service.getSearchFiltersItems().pipe(take(1)).toPromise();
            expect(services).toEqual({
                id: 'app.search.filters',
                items: [
                    {
                        id: 'app.search.filters.filter2',
                        component: 'workspace-hxp-search-filter.filter2',
                    },
                    {
                        id: 'app.search.filters.filter3',
                        component: 'workspace-hxp-search-filter.filter3',
                    },
                ],
            });
        });
    });
});
