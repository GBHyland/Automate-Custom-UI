/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSourceSearchFilterComponent } from './data-source-search-filter.component';
import { DataSourceSearchFilterService } from './data-source-search-filter.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MultiSelectListSearchFilterHarness } from '../base/multi-select-list-filter/multi-select-list-search-filter-harness';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HarnessLoader } from '@angular/cdk/testing';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';

describe('DataSourceSearchFilterComponent', () => {
    let fixture: ComponentFixture<DataSourceSearchFilterComponent>;
    let component: DataSourceSearchFilterComponent;
    let dataSourceSearchFilterService: DataSourceSearchFilterService;
    let loader: HarnessLoader;

    const mockDataSources = [
        { label: 'Data Source 1', value: 'ds1', icon: 'internal_repository' },
        { label: 'Data Source 2', value: 'ds2', icon: 'internal_repository' },
    ];

    const mockDataSourceSearchFilterService = {
        getDataSources: jest.fn().mockReturnValue(of(mockDataSources)),
        toQueryParams: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DataSourceSearchFilterComponent, NoopAnimationsModule, NoopTranslateModule, MatIconTestingModule],
            providers: [
                {
                    provide: DataSourceSearchFilterService,
                    useValue: mockDataSourceSearchFilterService,
                },
            ],
        }).compileComponents();

        dataSourceSearchFilterService = TestBed.inject(DataSourceSearchFilterService);

        fixture = TestBed.createComponent(DataSourceSearchFilterComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
        fixture.detectChanges();
    });

    afterEach(() => {
        mockDataSourceSearchFilterService.getDataSources.mockClear();
    });

    it('should display filter label', async () => {
        const filterHarness = await loader.getHarness(MultiSelectListSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('GOVERNANCE.SEARCH.FILTERS.DATA_SOURCE.LABEL');
    });

    it('should call the filter service when loadOptions is called', () => {
        expect(dataSourceSearchFilterService.getDataSources).toHaveBeenCalled();
    });

    it('should call the service to get the query params', () => {
        const data = new MultiSelectListSearchFilterData([{ label: 'Data Source 1', value: 'ds1', icon: 'internal_repository' }]);

        component.toQueryParams(data);

        expect(dataSourceSearchFilterService.toQueryParams).toHaveBeenCalledWith(data);
    });
});
