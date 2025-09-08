/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategorySearchFilterComponent } from './category-search-filter.component';
import { CategorySearchFilterService } from './category-search-filter.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MultiSelectListSearchFilterHarness } from '../base/multi-select-list-filter/multi-select-list-search-filter-harness';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HarnessLoader } from '@angular/cdk/testing';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';

describe('CategorySearchFilterComponent', () => {
    let fixture: ComponentFixture<CategorySearchFilterComponent>;
    let component: CategorySearchFilterComponent;
    let categorySearchFilterService: CategorySearchFilterService;
    let loader: HarnessLoader;

    const mockCategories = [
        { label: 'Category 1', value: 'cat1', tooltip: 'Tooltip 1' },
        { label: 'Category 2', value: 'cat2', tooltip: 'Tooltip 2' },
    ];

    const mockCategorySearchFilterService = {
        getCategories: jest.fn().mockReturnValue(of(mockCategories)),
        toQueryParams: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategorySearchFilterComponent, NoopAnimationsModule, NoopTranslateModule, MatIconTestingModule],
            providers: [
                {
                    provide: CategorySearchFilterService,
                    useValue: mockCategorySearchFilterService,
                },
            ],
        }).compileComponents();

        categorySearchFilterService = TestBed.inject(CategorySearchFilterService);

        fixture = TestBed.createComponent(CategorySearchFilterComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
        fixture.detectChanges();
    });

    afterEach(() => {
        mockCategorySearchFilterService.getCategories.mockClear();
    });

    it('should display filter label', async () => {
        const filterHarness = await loader.getHarness(MultiSelectListSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('GOVERNANCE.SEARCH.FILTERS.CATEGORY.LABEL');
    });

    it('should call the filter service when loadOptions is called', () => {
        expect(categorySearchFilterService.getCategories).toHaveBeenCalled();
    });

    it('should call the service to get the query params', () => {
        const data = new MultiSelectListSearchFilterData([{ label: 'Category 1', value: 'cat1', tooltip: 'Tooltip 1' }]);

        component.toQueryParams(data);

        expect(categorySearchFilterService.toQueryParams).toHaveBeenCalledWith(data);
    });
});
