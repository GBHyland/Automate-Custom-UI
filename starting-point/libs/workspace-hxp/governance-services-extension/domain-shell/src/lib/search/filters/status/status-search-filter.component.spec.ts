/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusSearchFilterComponent } from './status-search-filter.component';
import { StatusSearchFilterService } from './status-search-filter.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MultiSelectListSearchFilterHarness } from '../base/multi-select-list-filter/multi-select-list-search-filter-harness';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';

describe('StatusSearchFilterComponent', () => {
    let fixture: ComponentFixture<StatusSearchFilterComponent>;
    let component: StatusSearchFilterComponent;
    let statusSearchFilterService: StatusSearchFilterService;
    let loader: HarnessLoader;

    const mockStatuses = [
        { label: 'Ready', value: 'Ready' },
        { label: 'Incomplete', value: 'Incomplete' },
    ];

    const mockStatusSearchFilterService = {
        getStatuses: jest.fn().mockReturnValue(mockStatuses),
        toQueryParams: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatusSearchFilterComponent, NoopAnimationsModule, NoopTranslateModule, MatIconTestingModule],
            providers: [
                {
                    provide: StatusSearchFilterService,
                    useValue: mockStatusSearchFilterService,
                },
            ],
        }).compileComponents();

        statusSearchFilterService = TestBed.inject(StatusSearchFilterService);

        fixture = TestBed.createComponent(StatusSearchFilterComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
        fixture.detectChanges();
    });

    afterEach(() => {
        mockStatusSearchFilterService.getStatuses.mockClear();
    });

    it('should display filter label', async () => {
        const filterHarness = await loader.getHarness(MultiSelectListSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('GOVERNANCE.SEARCH.FILTERS.STATUS.LABEL');
    });

    it('should call the filter service when loadOptions is called', () => {
        expect(statusSearchFilterService.getStatuses).toHaveBeenCalled();
    });

    it('should call the service to get the query params', () => {
        const data = new MultiSelectListSearchFilterData([{ label: 'Ready', value: 'Ready' }]);

        component.toQueryParams(data);

        expect(mockStatusSearchFilterService.toQueryParams).toHaveBeenCalledWith(data);
    });
});
