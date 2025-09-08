/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { SearchResultsComponent } from './search-results.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DataColumnComponent, DataColumnListComponent, NoopTranslateModule, UserPreferencesService, JwtHelperService } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockComponents, MockProvider, MockService, ngMocks } from 'ng-mocks';
import { By } from '@angular/platform-browser';
import { MODEL_API_TOKEN, queryApiProvider, mockHxcsJsClientConfigurationService, uploadApiProvider } from '@alfresco/adf-hx-content-services/api';
import { generateMockResponse, mocks, a11yReport } from '@hxp/workspace-hxp/shared/testing';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import { registerLocaleData } from '@angular/common';
import { Document, ModelApi } from '@hylandsoftware/hxcs-js-client';
import { MatTabsModule } from '@angular/material/tabs';
import {
    DocumentService,
    ContextMenuActionsService,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    DEFAULT_PAGE_SIZE,
    SearchService,
    ManageVersionsButtonActionService,
    SearchType,
    ColumnConfigService,
    ColumnDataService,
    SearchFilterData,
    SearchFiltersExtensionsService,
    SearchFilterValueService,
    SearchFilterValueStoreService,
    DocumentUpdateInfo,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    DocumentActionService,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_MANAGE_COLUMN_ACTION_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { TemplateRef } from '@angular/core';
import { DynamicExtensionComponent, ExtensionService } from '@alfresco/adf-extensions';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginatorHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { PageSizeStorageService } from '@hxp/workspace-hxp/content-services-extension/shared/util';
import { ContentRepositoryComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/feature-shell';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import {
    ContentPropertyViewerActionService,
    DeleteButtonActionService,
    HxpPropertiesSidebarComponent,
    ManageVersionsSidebarComponent,
    SearchNoResultsComponent,
    SearchTermFilterComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { MatTabHarness } from '@angular/material/tabs/testing';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

const mockColumns = [
    { key: 'icon', title: 'File Type', sortable: false, removable: true },
    { key: 'title', title: 'Title', sortable: true, removable: false },
];

registerLocaleData(localeEn, 'en', localeEnExtra);

const SEARCH_FILTERS_REF = {
    id: 'app.search.filters',
    items: [
        {
            id: 'app.search.filters.created-date-filter',
            component: 'workspace-hxp-search-filter.created-date-filter',
        },
        {
            id: 'app.search.filters.document-category-filter',
            component: 'workspace-hxp-search-filter.document-category-filter',
        },
    ],
};

const EXTENSION_CONFIG = {
    $schema: '../../../extension.schema.json',
    $id: 'app.core',
    $name: 'app.core',
    $version: '0.0.1',
    $vendor: 'Hyland Software, Ltd.',
    $license: 'LGPL-3.0',
    $runtime: '1.7.0',
    $description: 'Test search features extension',
    $references: [],
    $ignoreReferenceList: [],
    features: {
        search: {
            filters: SEARCH_FILTERS_REF,
        },
    },
};

const SEARCH_ROUTE = 'search';

const SEARCH_TYPES: {
    name: string;
    tabIndex: number;
    type: SearchType;
    searchTerm: string;
    query: string;
    displayFilters: boolean;
}[] = [
    {
        name: 'Basic search',
        tabIndex: 0,
        type: SearchType.BASIC,
        searchTerm: 'test',
        query: "SELECT * FROM SysContent WHERE sys_fulltext = 'test*'",
        displayFilters: true,
    },
    {
        name: 'HXQL search',
        tabIndex: 1,
        type: SearchType.HXQL,
        searchTerm: "SELECT * FROM SysContent WHERE sys_fulltext = 'test*'",
        query: "SELECT * FROM SysContent WHERE sys_fulltext = 'test*'",
        displayFilters: false,
    },
];

describe('SearchResultsComponent', () => {
    let component: SearchResultsComponent;
    let fixture: ComponentFixture<SearchResultsComponent>;
    let extensionService: ExtensionService;
    let loader: HarnessLoader;
    let router: Router;
    let searchService: SearchService;
    let searchServiceSpy: jasmine.Spy;
    let navigateByUrlSpy: jasmine.Spy;
    let navigateSpy: jasmine.Spy;
    let documentUpdated$;

    const mockTemplateRefs = new Map<string, any>();
    mockTemplateRefs.set('icon', jasmine.createSpyObj('TemplateRef', ['']));
    mockTemplateRefs.set('title', jasmine.createSpyObj('TemplateRef', ['']));

    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);
    const mockContentPropertyViewerActionService = MockService(ContentPropertyViewerActionService);
    const mockDocumentService = MockService(DocumentService);
    const mockModelApi: ModelApi = MockService(ModelApi);
    const mockPageSizeStorageService = MockService(PageSizeStorageService);
    const mockSearchFiltersExtensionService = MockService(SearchFiltersExtensionsService);
    const mockSearchFilterValueService = MockService(SearchFilterValueService);
    const mockSearchFilterValueStoreService = MockService(SearchFilterValueStoreService);
    const mockColumnConfigService = MockService(ColumnConfigService);
    const mockJwtHelperService = MockService(JwtHelperService);

    const changeSearchTab = async (tabIndex: number) => {
        const tabs = await loader.getAllHarnesses(MatTabHarness);
        const targetActiveTab = tabs[tabIndex];
        await targetActiveTab.select();
    };

    const configureMockServices = () => {
        mockSearchFiltersExtensionService.getSearchFiltersItems = () => of(SEARCH_FILTERS_REF);

        mockColumnConfigService.getSelectedColumnsForCurrentUser = () => [];
        mockColumnConfigService.columnConfigs$ = of([]);

        mockSearchFilterValueService.filterApplied$ = new Subject();
        mockSearchFilterValueService.filterReset$ = new Subject();
        mockSearchFilterValueService.toHXQL = () => SEARCH_TYPES[0].query;

        spyOn(mockModelApi, 'getModel').and.returnValue(generateMockResponse({ data: mocks.modelApi }));

        spyOn(mockDocumentService, 'getDocumentById').and.returnValue(of(mocks.folderDocument));
        mockDocumentService.documentCreated$ = new Subject<Document>();
        mockDocumentService.documentDeleted$ = new Subject<string>();
        mockDocumentService.documentRequestReload$ = new Subject<void>();
        mockDocumentService.clearDocumentSelection$ = new Subject<void>();
        mockManageVersionsButtonActionService.showVersionsPanel$ = new Subject<boolean>();
        mockContentPropertyViewerActionService.showPropertyPanel$ = new Subject<boolean>();

        mockPageSizeStorageService.getSize = () => DEFAULT_PAGE_SIZE;

        searchServiceSpy = spyOn(searchService, 'getDocumentsByQuery').and.returnValue(of(mocks.searchResults));

        extensionService.setup$ = of(EXTENSION_CONFIG);

        navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.callThrough();
        navigateSpy = spyOn(router, 'navigate');
    };

    const mockDocumentDownloadActionService: DocumentActionService = MockService(DocumentActionService, {
        isAvailable: () => true,
    });
    const mockContentShareButtonActionService: DocumentActionService = MockService(DocumentActionService, {
        isAvailable: () => true,
    });

    const configureTestingModule = () => {
        TestBed.configureTestingModule({
            imports: [
                NoopTranslateModule,
                NoopAnimationsModule,
                MatPaginatorModule,
                HttpClientTestingModule,
                MatTabsModule,
                MatTooltipModule,
                RouterTestingModule,
                SearchNoResultsComponent,
                ContentRepositoryComponent,
                SearchResultsComponent,
                MockComponents(
                    DataColumnComponent,
                    DataColumnListComponent,
                    DynamicExtensionComponent,
                    HxpPropertiesSidebarComponent,
                    SearchTermFilterComponent,
                    ManageVersionsSidebarComponent
                ),
            ],
            providers: [
                queryApiProvider,
                mockHxcsJsClientConfigurationService,
                SearchService,
                MockProvider(HXP_DOCUMENT_INFO_ACTION_SERVICE, mockContentPropertyViewerActionService),
                MockProvider(ManageVersionsButtonActionService, mockManageVersionsButtonActionService),
                MockProvider(UserPreferencesService, { select: () => of('ltr') as any }),
                MockProvider(ContextMenuActionsService),
                MockProvider(ExtensionService),
                MockProvider(ColumnDataService),
                MockProvider(PageSizeStorageService, mockPageSizeStorageService),
                MockProvider(SearchFiltersExtensionsService, mockSearchFiltersExtensionService),
                MockProvider(DocumentService, mockDocumentService),
                MockProvider(SearchFilterValueService, mockSearchFilterValueService),
                MockProvider(SearchFilterValueStoreService, mockSearchFilterValueStoreService),
                MockProvider(JwtHelperService, mockJwtHelperService),
                { provide: ColumnConfigService, useValue: mockColumnConfigService },
                { provide: MODEL_API_TOKEN, useValue: mockModelApi },
                provideMockFeatureFlags({}),
                uploadApiProvider,
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useClass: DeleteButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useValue: mockDocumentDownloadActionService,
                },
                {
                    provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
                    useValue: mockContentShareButtonActionService,
                },
                {
                    provide: HXP_MANAGE_COLUMN_ACTION_SERVICE,
                    useValue: {
                        isAvailable: () => true,
                    },
                },
            ],
        }).compileComponents();

        ngMocks.autoSpy('jasmine');
        documentUpdated$ = new Subject<DocumentUpdateInfo>();
        mockDocumentService.documentUpdated$ = documentUpdated$.asObservable();

        searchService = TestBed.inject(SearchService);
        router = TestBed.inject(Router);
        extensionService = TestBed.inject(ExtensionService);

        configureMockServices();

        fixture = TestBed.createComponent(SearchResultsComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        (component as any).getTemplateRefByKey = (key: string) => mockTemplateRefs.get(key) as TemplateRef<any>;

        fixture.detectChanges();
        component.ngAfterViewInit();
    };

    for (const searchTypeConfig of SEARCH_TYPES) {
        const { name, tabIndex, type, searchTerm, query, displayFilters } = searchTypeConfig;
        const nextActiveTabIndex = (tabIndex + 1) % 2;

        describe(name, () => {
            const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'color-contrast': 2 }];

            beforeEach(() => {
                configureTestingModule();
            });

            beforeEach(async () => {
                await changeSearchTab(tabIndex);
                fixture.detectChanges();
                await fixture.whenStable();

                // changing the tab triggers a navigation, so we need to reset the spies
                navigateByUrlSpy.calls.reset();
                navigateSpy.calls.reset();
            });

            afterEach(() => {
                searchServiceSpy.calls.reset();
            });

            it('should not allow any search if no filter is applied', async () => {
                const searchButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-search-button' }));
                const resetButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-reset-button' }));

                expect(searchButton).toBeDefined();
                expect(resetButton).toBeDefined();
                expect(await searchButton.isDisabled()).toBeTrue();
                expect(await resetButton.isDisabled()).toBeTrue();
                expect(searchServiceSpy).not.toHaveBeenCalled();
            });

            it('should send search request and display results', fakeAsync(async () => {
                let resultsContainer = fixture.debugElement.query(By.css('.hxp-new-search-container'));
                const searchButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-search-button' }));
                const resetButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-reset-button' }));

                expect(resultsContainer).toBeFalsy();
                expect(searchButton).toBeDefined();
                expect(resetButton).toBeDefined();
                expect(await searchButton.isDisabled()).toBeTrue();
                expect(await resetButton.isDisabled()).toBeTrue();
                expect(searchServiceSpy).not.toHaveBeenCalled();

                const mockSearchTermFilter = ngMocks.find<SearchTermFilterComponent>('hxp-search-term-filter').componentInstance;
                mockSearchTermFilter.searchTermChanged.emit(searchTerm);
                mockSearchTermFilter.applyFilter = () => {
                    mockSearchFilterValueService.filterApplied$.next({ value: {} as SearchFilterData, filter: mockSearchTermFilter });
                };

                expect(await searchButton.isDisabled()).toBeFalse();
                expect(await resetButton.isDisabled()).toBeFalse();

                await searchButton.click();
                fixture.detectChanges();
                tick(500);

                expect(searchServiceSpy).toHaveBeenCalledWith(query, {
                    pagination: {
                        skipCount: 0,
                        maxItems: DEFAULT_PAGE_SIZE,
                    },
                    sort: [],
                });
                expect(await searchButton.isDisabled()).toBeTrue();

                resultsContainer = fixture.debugElement.query(By.css('.hxp-new-search-container'));

                expect(resultsContainer).toBeTruthy();
            }));

            it('should not render any results and paginator when no results are found', fakeAsync(async () => {
                searchServiceSpy.and.returnValue(of(mocks.noSearchResults));

                const searchButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-search-button' }));
                const resetButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-reset-button' }));

                expect(searchButton).toBeDefined();
                expect(resetButton).toBeDefined();
                expect(await searchButton.isDisabled()).toBeTrue();
                expect(await resetButton.isDisabled()).toBeTrue();
                expect(searchServiceSpy).not.toHaveBeenCalled();

                const mockSearchTermFilter = ngMocks.find<SearchTermFilterComponent>('hxp-search-term-filter').componentInstance;
                mockSearchTermFilter.searchTermChanged.emit(searchTerm);
                mockSearchTermFilter.applyFilter = () => {
                    mockSearchFilterValueService.filterApplied$.next({ value: {} as SearchFilterData, filter: mockSearchTermFilter });
                };

                expect(await searchButton.isDisabled()).toBeFalse();
                expect(await resetButton.isDisabled()).toBeFalse();

                await searchButton.click();
                fixture.detectChanges();
                tick(500);

                expect(searchServiceSpy).toHaveBeenCalled();

                const noPaginator = await PaginatorHarnessUtils.getAllPaginator({ fixture });
                const noResultsComponent = fixture.debugElement.query(By.css('hxp-search-no-results'));

                expect(noPaginator).toHaveSize(0);
                expect(noResultsComponent).toBeTruthy();
            }));

            it('should send search request on pagination change', fakeAsync(async () => {
                const searchButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-search-button' }));
                const resetButton = await loader.getHarness(MatButtonHarness.with({ selector: '#hxp-search-results-reset-button' }));

                expect(searchButton).toBeDefined();
                expect(resetButton).toBeDefined();
                expect(await searchButton.isDisabled()).toBeTrue();
                expect(await resetButton.isDisabled()).toBeTrue();
                expect(searchServiceSpy).not.toHaveBeenCalled();

                const mockSearchTermFilter = ngMocks.find<SearchTermFilterComponent>('hxp-search-term-filter').componentInstance;
                mockSearchTermFilter.searchTermChanged.emit(searchTerm);
                mockSearchTermFilter.applyFilter = () => {
                    mockSearchFilterValueService.filterApplied$.next({ value: {} as SearchFilterData, filter: mockSearchTermFilter });
                };

                expect(await searchButton.isDisabled()).toBeFalse();
                expect(await resetButton.isDisabled()).toBeFalse();

                await searchButton.click();
                fixture.detectChanges();
                tick(500);

                component.onPaginationChange({ pageIndex: 1, pageSize: DEFAULT_PAGE_SIZE, length: 100 });
                component.ngAfterViewInit();
                fixture.detectChanges();

                tick(500);

                expect(searchServiceSpy).toHaveBeenCalledWith(query, {
                    pagination: {
                        skipCount: DEFAULT_PAGE_SIZE,
                        maxItems: DEFAULT_PAGE_SIZE,
                    },
                    sort: [],
                });
            }));

            it('should show and hide property panel', fakeAsync(() => {
                let resultsContainer = fixture.debugElement.query(By.css('.hxp-properties-sidebar'));
                component.handleCurrentSelection([mocks.fileDocument]);

                expect(resultsContainer).toBeFalsy();
                expect(component.actionContext.showPanel).toBeUndefined();

                (mockContentPropertyViewerActionService.showPropertyPanel$ as Subject<boolean>).next(true);

                fixture.detectChanges();
                tick();

                resultsContainer = fixture.debugElement.query(By.css('.hxp-properties-sidebar'));

                expect(component.actionContext.showPanel).toEqual('property');
                expect(resultsContainer).toBeTruthy();

                spyOn(mockContentPropertyViewerActionService, 'execute');

                component.handleCloseSidebarPanel();

                fixture.detectChanges();
                tick();

                expect(component.actionContext.showPanel).toBeUndefined();
                expect(mockContentPropertyViewerActionService.execute).toHaveBeenCalledWith(component.actionContext);

                resultsContainer = fixture.debugElement.query(By.css('.hxp-properties-sidebar'));

                expect(resultsContainer).toBeFalsy();
            }));

            it('should set editable value depending the document permissions', fakeAsync(() => {
                expect((component as any).editablePropertiesSidebar).toBeFalse();

                component.handleCurrentSelection([mocks.fileDocument]);

                expect((component as any).editablePropertiesSidebar).toBeTrue();

                component.handleCurrentSelection([{ ...mocks.fileDocument, sys_effectivePermissions: ['Read'] }]);

                expect((component as any).editablePropertiesSidebar).toBeFalse();
            }));

            it('should show and hide manage version panel', fakeAsync(() => {
                let resultsContainer = fixture.debugElement.query(By.css('#manage-versions-sidebar'));
                component.handleCurrentSelection([mocks.versionSupportedDocument]);

                expect(resultsContainer).toBeFalsy();
                expect(component.actionContext.showPanel).toBeUndefined();

                (mockManageVersionsButtonActionService.showVersionsPanel$ as Subject<boolean>).next(true);

                fixture.detectChanges();
                tick();

                resultsContainer = fixture.debugElement.query(By.css('#manage-versions-sidebar'));

                expect(component.actionContext.showPanel).toEqual('version');
                expect(resultsContainer).toBeTruthy();

                component.handleCloseSidebarPanel();

                fixture.detectChanges();
                tick();

                expect(component.actionContext.showPanel).toBeUndefined();

                resultsContainer = fixture.debugElement.query(By.css('#manage-versions-sidebar'));

                expect(resultsContainer).toBeFalsy();
            }));

            it('should properly initialize columnConfigs with corresponding template references', fakeAsync(() => {
                expect(component.columnConfigs.length).toBe(0);

                mockColumnConfigService.getSelectedColumnsForCurrentUser = () => mockColumns;
                mockColumnConfigService.columnConfigs$ = of(mockColumns);

                component.ngAfterViewInit();
                tick();
                fixture.detectChanges();

                expect(component.columnConfigs.length).toBe(2);
                expect(component.columnConfigs[0].key).toEqual('icon');
                expect(component.columnConfigs[1].key).toEqual('title');
                expect(component.columnConfigs[0].templateRef).toBe(mockTemplateRefs.get('icon'));
                expect(component.columnConfigs[1].templateRef).toBe(mockTemplateRefs.get('title'));
            }));

            it('should re-initialize search results when document changes are detected', fakeAsync(() => {
                (component as any).searchTerm = searchTerm;

                expect(searchServiceSpy).not.toHaveBeenCalled();

                (mockDocumentService.documentCreated$ as Subject<Document>).next({} as any);
                (mockDocumentService.documentDeleted$ as Subject<string>).next({} as any);
                (mockDocumentService.documentRequestReload$ as Subject<void>).next({} as any);

                tick(2000);

                expect(searchServiceSpy).toHaveBeenCalled();
            }));

            it('should call debounceSearch when a document in results list is updated', () => {
                const testDocument = mocks.searchResults.documents[0];
                component.documents = [testDocument];
                const debounceSearchSpy = spyOn<any>(component, 'debounceSearch');

                documentUpdated$.next({
                    document: testDocument,
                    updatedProperties: undefined,
                });

                expect(debounceSearchSpy).toHaveBeenCalled();
            });

            it('should not call debounceSearch when updated document is not in results list', () => {
                component.documents = [mocks.searchResults.documents[0]];
                const debounceSearchSpy = spyOn<any>(component, 'debounceSearch');

                const unrelatedDocument: Document = {
                    sys_id: 'unrelated-id',
                    sys_primaryType: 'Document',
                    sys_mixinTypes: [],
                };
                documentUpdated$.next({
                    document: unrelatedDocument,
                    updatedProperties: undefined,
                });

                expect(debounceSearchSpy).not.toHaveBeenCalled();
            });

            it('should switch search type on tab change', async () => {
                await changeSearchTab(nextActiveTabIndex);
                expect(component.type).toEqual(SEARCH_TYPES[nextActiveTabIndex].type);

                await changeSearchTab(tabIndex);
                expect(component.type).toEqual(type);
            });

            it('should reset query on tab change', async () => {
                component.query = searchTerm;
                await changeSearchTab(nextActiveTabIndex);

                expect(component.query).toEqual('');

                component.query = searchTerm;
                await changeSearchTab(tabIndex);

                expect(component.query).toEqual('');
            });

            it('should update the url when switching tabs', fakeAsync(async () => {
                expect(navigateSpy).not.toHaveBeenCalled();
                expect(navigateByUrlSpy).not.toHaveBeenCalled();

                const targetTabIndex = nextActiveTabIndex;
                await changeSearchTab(targetTabIndex);
                fixture.detectChanges();

                expect(navigateByUrlSpy).toHaveBeenCalledWith('/');

                tick(500);

                expect(navigateSpy).toHaveBeenCalledWith([SEARCH_ROUTE], {
                    queryParams: {
                        q: '',
                        type: SEARCH_TYPES[targetTabIndex].type,
                    },
                });

                flush();
            }));

            it('should keep search type on pagination change', fakeAsync(() => {
                (component as any).searchTerm = searchTerm;
                component.type = type;

                expect(searchServiceSpy).not.toHaveBeenCalled();

                component.onPaginationChange({ pageIndex: 1, pageSize: 25, length: 100 });
                tick();
                expect(searchServiceSpy).toHaveBeenCalledWith(component.query, {
                    pagination: {
                        skipCount: DEFAULT_PAGE_SIZE,
                        maxItems: DEFAULT_PAGE_SIZE,
                    },
                    sort: [],
                });
                expect(component.type).toEqual(type);

                searchServiceSpy.calls.reset();

                component.onPaginationChange({ pageIndex: 2, pageSize: DEFAULT_PAGE_SIZE, length: 100 });
                tick();
                expect(searchServiceSpy).toHaveBeenCalledWith(component.query, {
                    pagination: {
                        skipCount: DEFAULT_PAGE_SIZE * 2,
                        maxItems: DEFAULT_PAGE_SIZE,
                    },
                    sort: [],
                });
                expect(component.type).toEqual(type);
            }));

            if (displayFilters) {
                it('should display search filters', async () => {
                    component.ngAfterViewInit();
                    fixture.detectChanges();

                    const filtersContainers = fixture.debugElement.queryAll(By.directive(DynamicExtensionComponent));
                    expect(filtersContainers).toHaveSize(2);

                    const [createdDateFilter, documentCategoryFilter] = filtersContainers;

                    expect(createdDateFilter?.componentInstance.id).toEqual(SEARCH_FILTERS_REF.items[0].component);
                    expect(documentCategoryFilter?.componentInstance.id).toEqual(SEARCH_FILTERS_REF.items[1].component);
                });
            } else {
                it('should not display search filters', () => {
                    component.ngAfterViewInit();
                    fixture.detectChanges();

                    const filtersContainers = fixture.debugElement.queryAll(By.directive(DynamicExtensionComponent));
                    expect(filtersContainers).toHaveSize(0);
                });
            }

            // eslint-disable-next-line ban/ban
            xit('tabs should pass accessibility checks', async () => {
                mockColumnConfigService.getSelectedColumnsForCurrentUser = () => mockColumns;
                mockColumnConfigService.columnConfigs$ = of(mockColumns);

                component.ngAfterViewInit();
                fixture.detectChanges();

                component.query = query;
                await changeSearchTab(tabIndex);
                fixture.detectChanges();

                await fixture.whenStable();

                const res = await a11yReport('.hxp-search-tabs');

                expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
            });
        });
    }
});
