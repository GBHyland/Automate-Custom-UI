/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifierSearchFilterComponent } from './modifier-search-filter.component';
import { ModifierSearchFilterService } from './modifier-search-filter.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MultiSelectListSearchFilterHarness } from '../base/multi-select-list-filter/multi-select-list-search-filter-harness';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HarnessLoader } from '@angular/cdk/testing';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';

describe('ModifierSearchFilterComponent', () => {
    let fixture: ComponentFixture<ModifierSearchFilterComponent>;
    let modifierSearchFilterService: ModifierSearchFilterService;
    let loader: HarnessLoader;

    const mockModifiers = [
        { label: 'User 1', value: 'user1', id: 'user1' },
        { label: 'User 2', value: 'user2', id: 'user2' },
    ];

    const mockModifierSearchFilterService = {
        getModifiers: jest.fn().mockReturnValue(of(mockModifiers)),
        toQueryParams: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModifierSearchFilterComponent, NoopAnimationsModule, NoopTranslateModule, MatIconTestingModule],
            providers: [
                {
                    provide: ModifierSearchFilterService,
                    useValue: mockModifierSearchFilterService,
                },
            ],
        }).compileComponents();

        modifierSearchFilterService = TestBed.inject(ModifierSearchFilterService);

        fixture = TestBed.createComponent(ModifierSearchFilterComponent);
        loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
        fixture.detectChanges();
    });

    afterEach(() => {
        mockModifierSearchFilterService.getModifiers.mockClear();
    });

    it('should display filter label', async () => {
        const filterHarness = await loader.getHarness(MultiSelectListSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('GOVERNANCE.SEARCH.FILTERS.MODIFIER.LABEL');
    });

    it('should call the filter service when loadOptions is called', () => {
        expect(modifierSearchFilterService.getModifiers).toHaveBeenCalled();
    });

    it('should call the service to get the query params', () => {
        const data = new MultiSelectListSearchFilterData([{ label: 'User 1', value: 'user1', id: 'user1' }]);

        fixture.componentInstance.toQueryParams(data);

        expect(modifierSearchFilterService.toQueryParams).toHaveBeenCalledWith(data);
    });
});
