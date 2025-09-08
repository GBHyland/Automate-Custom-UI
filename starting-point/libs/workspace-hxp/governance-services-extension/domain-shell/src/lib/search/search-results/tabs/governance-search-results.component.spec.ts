/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GovernanceSearchResultsComponent } from './governance-search-results.component';
import { DatePipe, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MockComponents } from 'ng-mocks';
import { DataSourceSearchFilterComponent } from '../../filters/data-source/data-source-search-filter.component';
import { CategorySearchFilterComponent } from '../../filters/category/category-search-filter.component';
import { mockGovernanceSearchResults } from '../../../mocks/mock-results.data';
import { of, Subject } from 'rxjs';
import { GovernanceSearchService } from '.././services/governance-search.service';
import { SearchFilterValueService } from '../../filters/base/search-filter-value.service';
import { CreatorSearchFilterComponent } from '../../filters/creator/creator-search-filter.component';
import { ModifierSearchFilterComponent } from '../../filters/modifier/modifier-search-filter.component';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { GovernanceRecordService } from '../../../record-management/services/governance-record.service';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';

describe('GovernanceSearchResultsComponent', () => {
    let component: GovernanceSearchResultsComponent;
    let fixture: ComponentFixture<GovernanceSearchResultsComponent>;
    const filterAppliedSubject = new Subject<void>();
    const filterResetSubject = new Subject<void>();
    const updateConfirmedSubject = new Subject<any>();
    const deleteConfirmedSubject = new Subject<void>();
    const recordAssignedSubject = new Subject<void>();

    const mockSearchService = {
        search: jest.fn().mockReturnValue(
            of({
                content: mockGovernanceSearchResults,
                lastEvaluatedKey: 'next-key',
            })
        ),
        clearCache: jest.fn(),
        lastEvaluatedKey: undefined,
        content: [],
    };

    const mockFilterService = {
        filterApplied$: filterAppliedSubject.asObservable(),
        filterReset$: filterResetSubject.asObservable(),
        toQueryParams: jest.fn().mockReturnValue({ dataSource: 'Internal Repository' }),

        hasFilters: jest.fn().mockReturnValue(true),
        clearFilters: jest.fn(),
    };

    const mockOAuthStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    };

    const mockGovernanceRecordService = {
        editRecord: jest.fn(),
        emitUpdateConfirmed: jest.fn(),
        updateConfirmed$: updateConfirmedSubject.asObservable(),
        deleteConfirmed$: deleteConfirmedSubject.asObservable(),
    };

    const mockGovernanceLegalHoldManagementService = {
        shouldRefreshList$: of(false),
        recordAssigned$: recordAssignedSubject.asObservable(),
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                MockComponents(
                    DataSourceSearchFilterComponent,
                    CategorySearchFilterComponent,
                    CreatorSearchFilterComponent,
                    ModifierSearchFilterComponent
                ),
                GovernanceSearchResultsComponent,
                MatButtonModule,
                MatIconTestingModule,
                NoopAnimationsModule,
                NoopTranslateModule,
                NoopAnimationsModule,
            ],
            providers: [
                AsyncPipe,
                DatePipe,
                { provide: GovernanceSearchService, useValue: mockSearchService },
                { provide: SearchFilterValueService, useValue: mockFilterService },
                { provide: OAuthStorage, useValue: mockOAuthStorage },
                {
                    provide: GovernanceConfigurationService,
                    useValue: {
                        getJwtConfig: jest.fn().mockReturnValue({}),
                        getConfig: jest.fn().mockReturnValue(
                            of({
                                dataSources: [{ id: 'test' }],
                                categories: [{ id: 'cat1', name: 'Category 1' }],
                            })
                        ),
                    },
                },
                { provide: GovernanceRecordService, useValue: mockGovernanceRecordService },
                { provide: FeaturesServiceToken, useValue: { isOn$: () => of(true) } },
                {
                    provide: GovernanceLegalHoldManagementService,
                    useValue: mockGovernanceLegalHoldManagementService,
                },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GovernanceSearchResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display initial state view when no filters are selected', () => {
        const initialStateElement = fixture.nativeElement.querySelector('.hxp-governance-search-results-initial-state');
        expect(initialStateElement).toBeTruthy();

        const initialStateElementIcon = fixture.nativeElement.querySelector('.hxp-governance-search-results-initial-state_icon');
        expect(initialStateElementIcon).toBeTruthy();

        const initialStateElementLabel = fixture.nativeElement.querySelector('.hxp-governance-search-results-initial-state_label');
        expect(initialStateElementLabel).toBeTruthy();
    });

    it('should not display any records in the result list when mock data is empty', () => {
        component.initialState = false;
        component.noResults = true;
        component.isLoading = false;
        fixture.detectChanges();
        const recordList = fixture.nativeElement.querySelector('hxp-record-list');
        expect(recordList).toBeFalsy();
        // But there should be no rows rendered
        const rows = fixture.nativeElement.querySelectorAll('.hxp-record-list-row');
        expect(rows.length).toBe(0);
    });

    it('should call reset and clear filters', () => {
        const clearFiltersSpy = spyOn(component['searchFilterValueService'], 'clearFilters');
        component.hasPendingChanges = true;
        component.noResults = true;
        component.previousKeys = ['a'];
        component.lastEvaluatedKey = 'key';
        component.reset();
        expect(component.hasPendingChanges).toBeFalsy();
        expect(component.noResults).toBeFalsy();
        expect(component.previousKeys).toEqual([]);
        expect(component.lastEvaluatedKey).toBeUndefined();
        expect(clearFiltersSpy).toHaveBeenCalled();
    });

    it('should call toggleSelectAll to clear selection if records are selected', () => {
        component.selectedRecords = [{} as any];
        component['recordList'] = { clearSelection: jasmine.createSpy('clearSelection') } as any;
        component.toggleSelectAll(false);
        expect(component['recordList'].clearSelection).toHaveBeenCalled();
    });

    it('should call toggleSelectAll to select all if no records are selected', () => {
        component.selectedRecords = [];
        component['recordList'] = { selectAll: jasmine.createSpy('selectAll') } as any;
        component.toggleSelectAll(true);
        expect(component['recordList'].selectAll).toHaveBeenCalled();
    });

    it('should call toggleSelectAll to select all if no records are selected (via button click)', () => {
        const mockRecordList = {
            isAllSelected: jest.fn().mockReturnValue(false),
            clearSelection: jasmine.createSpy('clearSelection'),
        };

        const mockData = mockGovernanceSearchResults.slice(0, 2);
        component.selectedRecords = [];
        component.records = mockData;
        (component as any).recordList = mockRecordList;
        component.isLoading = false;
        component.initialState = false;
        component.noResults = false;

        const toggleSpy = jest.spyOn(component, 'toggleSelectAll');
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('[data-testid="toggle-true"]');
        expect(button).toBeTruthy();
        button.click();

        fixture.detectChanges();
        // Check that the component method was called
        expect(toggleSpy).toHaveBeenCalledWith(true);
    });

    it('should update selectedRecords when onSelectionChanged is called', () => {
        const records = [{ contentId: '1' }, { contentId: '2' }] as any;
        component.onSelectionChanged(records);
        expect(component.selectedRecords).toEqual(records);
    });

    it('should update actionContext.records when onSelectionChanged is called', () => {
        const records = [{ contentId: '1' }, { contentId: '2' }] as any;
        component.onSelectionChanged(records);
        expect(component.actionContext.records).toEqual(records);
    });

    it('should call execute on recordPropertiesButtonService when onSelectionChanged is called with 0 or 2 records', () => {
        const records = [{ contentId: '1' }, { contentId: '2' }] as any;
        const executeSpy = spyOn(component['recordPropertiesButtonService'], 'execute');
        component.onSelectionChanged(records);
        expect(executeSpy).toHaveBeenCalled();
    });

    it('should update pageSize when onPageSizeChange is called', () => {
        component.onPageSizeChange(50);
        expect(component.pageSize).toBe(50);
    });

    it('should call loadNextPage if lastEvaluatedKey exists', () => {
        spyOn(component, 'search').and.callThrough();
        component.lastEvaluatedKey = 'key';
        component.loadNextPage();
        expect(component.search).toHaveBeenCalledWith('next');
    });

    it('should not call loadNextPage if lastEvaluatedKey does not exist', () => {
        spyOn(component, 'search');
        component.lastEvaluatedKey = undefined;
        component.loadNextPage();
        expect(component.search).not.toHaveBeenCalled();
    });

    it('should call loadPreviousPage if previousKeys has items', () => {
        spyOn(component, 'search');
        component.previousKeys = ['a'];
        component.loadPreviousPage();
        expect(component.search).toHaveBeenCalledWith('prev');
    });

    it('should not call loadPreviousPage if previousKeys is empty', () => {
        spyOn(component, 'search');
        component.previousKeys = [];
        component.loadPreviousPage();
        expect(component.search).not.toHaveBeenCalled();
    });

    it('should call loadNextPage when next button is clicked', () => {
        const mockRecordList = {
            isAllSelected: jest.fn().mockReturnValue(false),
            clearSelection: jasmine.createSpy('clearSelection'),
        };
        component.selectedRecords = [];
        component.records = mockGovernanceSearchResults;
        (component as any).recordList = mockRecordList;
        component.isLoading = false;
        component.initialState = false;
        component.noResults = false;
        component.lastEvaluatedKey = 'some-key';
        component.isLastPage = false;
        const loadNextPageSpy = jest.spyOn(component, 'loadNextPage');
        const searchSpy = jest.spyOn(component, 'search');
        fixture.detectChanges();
        const nextButton = fixture.nativeElement.querySelector('[data-testid="next-page-button"]');
        expect(nextButton).toBeTruthy();
        expect(nextButton.disabled).toBeFalsy();
        nextButton.click();
        expect(loadNextPageSpy).toHaveBeenCalled();
        expect(searchSpy).toHaveBeenCalledWith('next');
    });

    it('loadPreviousPage should be disabled when on first page', () => {
        const mockRecordList = {
            isAllSelected: jest.fn().mockReturnValue(false),
            clearSelection: jasmine.createSpy('clearSelection'),
        };
        component.selectedRecords = [];
        component.records = mockGovernanceSearchResults;
        (component as any).recordList = mockRecordList;
        component.isLoading = false;
        component.initialState = false;
        component.noResults = false;
        component.previousKeys = [];

        fixture.detectChanges();
        const prevButton = fixture.nativeElement.querySelector('[data-testid="prev-page-button"]');
        expect(prevButton).toBeTruthy();
        expect(prevButton.disabled).toBeTruthy();
    });

    it('should reset previousKeys when onPageSizeChange is called', () => {
        component.previousKeys = ['a'];
        component.onPageSizeChange(50);
        expect(component.previousKeys).toEqual([]);
    });

    it('should call search with init when onPageSizeChange is called', () => {
        spyOn(component, 'search');
        component.onPageSizeChange(50);
        expect(component.search).toHaveBeenCalledWith('init');
    });

    it('should refresh the list when a record is changed', () => {
        const searchSpy = jest.spyOn(component, 'search');
        updateConfirmedSubject.next({ id: 'abc' });
        expect(searchSpy).toHaveBeenCalled();
    });

    it('should refresh the list when a record is removed', () => {
        const searchSpy = jest.spyOn(component, 'search');
        deleteConfirmedSubject.next();
        expect(searchSpy).toHaveBeenCalled();
    });

    it('should refresh the list when recordAssigned$ emits', () => {
        const searchSpy = jest.spyOn(component, 'search');

        recordAssignedSubject.next();

        expect(searchSpy).toHaveBeenCalled();
    });
});
