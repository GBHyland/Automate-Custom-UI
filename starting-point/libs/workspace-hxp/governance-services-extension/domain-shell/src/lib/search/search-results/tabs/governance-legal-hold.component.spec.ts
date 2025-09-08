/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovernanceLegalHoldComponent } from './governance-legal-hold.component';
import { RecordListComponent } from '../record-list/record-list.component';
import { mockLegalHoldCasesData } from '../../../mocks/mock-legal-hold-cases.mock';
import { DataColumnComponent } from '../record-list/data-column.component';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { NoopTranslateModule, JwtHelperService } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { GovernanceLegalHoldService } from '../services/legal-hold/governance-legal-hold.service';
import { Sort } from '@angular/material/sort';
import { SafeHtml } from '@angular/platform-browser';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';

describe('GovernanceLegalHoldComponent', () => {
    let component: GovernanceLegalHoldComponent;
    let fixture: ComponentFixture<GovernanceLegalHoldComponent>;
    const mockAccessToken = 'mock-access-token';
    const refreshListSubject = new Subject<boolean>();

    const mockJwtHelperService = {
        getAccessToken: jest.fn().mockReturnValue(mockAccessToken),
    };

    const mockLegalHoldService = {
        queryLegalCases: jest.fn().mockReturnValue(of({ contents: mockLegalHoldCasesData, lastEvaluatedKey: 'key2' })),
    };

    const mockGovernanceLegalHoldManagementService = {
        shouldRefreshList$: refreshListSubject.asObservable(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GovernanceLegalHoldComponent,
                RecordListComponent,
                DataColumnComponent,
                MatIconModule,
                DatePipe,
                NgClass,
                TranslatePipe,
                NoopTranslateModule,
                NoopAnimationsModule,
            ],
            providers: [
                { provide: GovernanceLegalHoldService, useValue: mockLegalHoldService },
                { provide: JwtHelperService, useValue: mockJwtHelperService },
                { provide: GovernanceLegalHoldManagementService, useValue: mockGovernanceLegalHoldManagementService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GovernanceLegalHoldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        mockLegalHoldService.queryLegalCases.mockReset();
        mockLegalHoldService.queryLegalCases.mockReturnValue(of({ contents: mockLegalHoldCasesData, lastEvaluatedKey: 'key2' }));
    });

    it('should return false for hasSelection() when no records are selected', () => {
        component.selectedLegalCases = [];
        expect(component.hasSelection()).toBe(false);
    });

    it('should return true for hasSelection() when records are selected', () => {
        component.selectedLegalCases = [mockLegalHoldCasesData[0]];
        expect(component.hasSelection()).toBe(true);
    });

    it('should update selectedRecords on onSelectionChanged', () => {
        const cases = [mockLegalHoldCasesData[0], mockLegalHoldCasesData[1]];
        component.onSelectionChanged(cases);
        expect(component.selectedLegalCases).toEqual(cases);
    });

    it('should clear selectedRecords and call recordList.clearSelection on clearAll', () => {
        component.selectedLegalCases = [mockLegalHoldCasesData[0]];
        component.legalCasesList = { clearSelection: jest.fn() } as any;
        component.clearAll();
        expect(component.selectedLegalCases).toEqual([]);
        expect(component.legalCasesList.clearSelection).toHaveBeenCalled();
    });

    it('should return the correct selectedCount', () => {
        component.selectedLegalCases = [mockLegalHoldCasesData[0], mockLegalHoldCasesData[1]];
        expect(component.selectedCount).toBe(2);
        component.selectedLegalCases = [];
        expect(component.selectedCount).toBe(0);
    });

    it('should filter records based on searchText', () => {
        component.allCases = mockLegalHoldCasesData;
        component.onSearchInputChange('case a');
        expect(component.legalCases.every((r) => r.legalCaseName?.toLowerCase().includes('case a'))).toBe(true);
    });

    it('should reset filter when searchText is empty', () => {
        component.allCases = mockLegalHoldCasesData;
        component.searchText = 'some text';
        component.onSearchInputChange('');
        expect(component.legalCases).toEqual(mockLegalHoldCasesData);
    });

    it('should call queryTable and populate records on success', () => {
        const mockResponse = { contents: mockLegalHoldCasesData, lastEvaluatedKey: 'nextKey' };
        mockLegalHoldService.queryLegalCases.mockReturnValue(of(mockResponse));

        component.queryTable();

        expect(mockLegalHoldService.queryLegalCases).toHaveBeenCalled();
        expect(component.legalCases).toEqual(mockLegalHoldCasesData);
        expect(component.isLoading).toBe(false);
        expect(component.noResults).toBe(false);
        expect(component.lastEvaluatedKey).toBe('nextKey');
    });

    it('should handle error during queryTable and set noResults to true', () => {
        mockLegalHoldService.queryLegalCases.mockReturnValue(throwError(() => new Error('Network error')));

        component.queryTable();

        expect(component.isLoading).toBe(false);
        expect(component.noResults).toBe(true);
    });

    it('should update sort values and call queryTable on onSortingChanged', () => {
        const mockResponse = { contents: mockLegalHoldCasesData };
        mockLegalHoldService.queryLegalCases.mockReturnValue(of(mockResponse));

        const sort: Sort = { active: 'caseName', direction: 'asc' };
        component.onSortingChanged(sort);

        expect(component.sortColumn).toBe('caseName');
        expect(component.sortDirection).toBe('asc');
        expect(mockLegalHoldService.queryLegalCases).toHaveBeenCalled();
        expect(component.pageKeyStack).toEqual(['']);
    });

    it('should update pageSize, reset pagination, and queryTable on onPageSizeChange', () => {
        const spy = jest.spyOn(component, 'queryTable');
        component.onPageSizeChange(50);

        expect(component.pageSize).toBe(50);
        expect(component.currentPageIndex).toBe(0);
        expect(component.pageKeyStack).toEqual(['']);
        expect(spy).toHaveBeenCalledWith('', true);
    });

    it('should load next page if lastEvaluatedKey exists', () => {
        const spy = jest.spyOn(component, 'queryTable');
        component.lastEvaluatedKey = 'key123';
        component.loadNextPage();
        expect(spy).toHaveBeenCalledWith('key123', false);
    });

    it('should not load next page if lastEvaluatedKey is empty', () => {
        const spy = jest.spyOn(component, 'queryTable');
        component.lastEvaluatedKey = '';
        component.loadNextPage();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should load previous page if currentPageIndex > 0', () => {
        const spy = jest.spyOn(component, 'queryTable');
        component.pageKeyStack = ['', 'key1', 'key2'];
        component.currentPageIndex = 2;

        component.loadPreviousPage();
        expect(spy).toHaveBeenCalledWith('key1', true);
        expect(component.currentPageIndex).toBe(1);
    });

    it('should not load previous page if currentPageIndex <= 0', () => {
        const spy = jest.spyOn(component, 'queryTable');
        component.currentPageIndex = 0;

        component.loadPreviousPage();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call highlightMatch and return highlighted SafeHtml', () => {
        component.searchText = 'case';
        const result: SafeHtml = component.highlightMatch('This is a case name') as SafeHtml;

        expect(result).toBeTruthy();
        expect(result.toString()).toContain('<mark>case</mark>');
    });

    it('should not highlight text if searchText is empty', () => {
        component.searchText = '';
        const result = component.highlightMatch('Some text');
        expect(result).toBe('Some text');
    });

    describe('Pagination buttons', () => {
        it('should disable previous button when on first page', () => {
            component.currentPageIndex = 0;
            expect(component.previousDisabled).toBeTruthy();
        });

        it('should enable previous button when not on first page', () => {
            component.currentPageIndex = 1;
            expect(component.previousDisabled).toBeFalsy();
        });

        it('should disable next button when there is no lastEvaluatedKey', () => {
            component.lastEvaluatedKey = '';
            expect(component.nextDisabled).toBeTruthy();
        });

        it('should enable next button when lastEvaluatedKey exists', () => {
            component.lastEvaluatedKey = 'abc123';
            expect(component.nextDisabled).toBeFalsy();
        });
    });

    it('should re-query table when shouldRefreshList$ emits true', () => {
        const spy = jest.spyOn(component, 'queryTable');

        refreshListSubject.next(true);
        expect(spy).toHaveBeenCalledWith('', true);
    });
});
