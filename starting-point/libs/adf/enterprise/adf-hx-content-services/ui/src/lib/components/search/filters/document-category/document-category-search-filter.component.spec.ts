/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { OverlayModule } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchActionIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { DocumentCategorySearchFiltersComponent } from '../document-category/document-category-search-filter.component';
import { ModelApi } from '@hylandsoftware/hxcs-js-client';
import { MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DocumentModelService, SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { MockComponent, MockService } from 'ng-mocks';
import { MatSelectModule } from '@angular/material/select';
import { a11yReport, generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { take } from 'rxjs/operators';
import { DocumentCategorySearchFilterData } from './document-category-search-filter.data';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DocumentCategorySearchFilterHarness } from './document-category-search-filter-harness';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { SearchFilterInputComponent } from '../../search-filter-input/search-filter-input.component';
import { getMockInput } from '../../search-filter-input/helpers';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';

// https://github.com/angular/components/issues/24605
const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [
    {
        label: 5,
    },
    {
        'nested-interactive': 5,
    },
];

const SELECTED_SYSFILE = new DocumentCategorySearchFilterData([{ label: 'SysFile', value: 'SysFile' }]);
const MULTIPLE_SELECTION = new DocumentCategorySearchFilterData([
    { label: 'SysFile', value: 'SysFile' },
    { label: 'SpecialFile', value: 'SpecialFile' },
]);

describe('DocumentCategorySearchFiltersComponent', () => {
    let loader: HarnessLoader;
    let component: DocumentCategorySearchFiltersComponent;
    let fixture: ComponentFixture<DocumentCategorySearchFiltersComponent>;
    let searchFilterValueService: SearchFilterValueService;

    const mockModelApi: ModelApi = MockService(ModelApi);

    let documentModelServiceSpy: jest.SpyInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
                MatSelectModule,
                NoopAnimationsModule,
                NoopTranslateModule,
                HttpClientTestingModule,
                OverlayModule,
                SearchActionIconComponent,
                MatTooltipModule,
                MatChipsModule,
                MatIconModule,
                MatDividerModule,
                MatInputModule,
                MatListModule,
                MatProgressSpinnerModule,
                SearchFilterContainerComponent,
                DocumentCategorySearchFiltersComponent,
                MockComponent(SearchFilterInputComponent),
            ],
            providers: [DocumentModelService, { provide: MODEL_API_TOKEN, useValue: mockModelApi }],
        });

        searchFilterValueService = TestBed.inject(SearchFilterValueService);
    });

    describe('with categories returned from the server', () => {
        beforeEach(() => {
            documentModelServiceSpy = jest.spyOn(mockModelApi, 'getModel').mockReturnValue(generateMockResponse({ data: jestMocks.modelApi }));

            fixture = TestBed.createComponent(DocumentCategorySearchFiltersComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        afterEach(async () => {
            // We need this to ensure the overlay is removed from the DOM
            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            if (await filterHarness?.isOpen()) {
                const clearFilterButton = await filterHarness.getClearButton();
                await clearFilterButton?.click();
                fixture.detectChanges();
                await fixture.whenStable();
            }
        });

        it('should display document category filter component', async () => {
            component.ngOnInit();
            fixture.detectChanges();
            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            const chipLabel = await filterHarness.getLabel();

            expect(documentModelServiceSpy).toHaveBeenCalled();
            expect(chipLabel).toBeTruthy();
            expect(await chipLabel?.text()).toBe('SEARCH.FILTERS.DOCUMENT_CATEGORY.LABEL');
            expect(await filterHarness.isOpen()).toBeFalsy();

            const noResults = await filterHarness.getNoResults();
            expect(noResults).toBeFalsy();
        });

        it('should display the input inside the overlay', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);

            expect(await filterHarness.isOpen()).toBeFalsy();
            await filterHarness.open();
            expect(await filterHarness.isOpen()).toBeTruthy();

            expect(getMockInput()).toBeTruthy();
        });

        it('should display the selection summary inside the overlay ', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            fixture.detectChanges();

            const summary = await filterHarness.getSummary();
            expect(summary).toBeTruthy();
            const summaryHost = await summary?.host();
            expect(summaryHost).toBeTruthy();
            expect(await summaryHost?.text()).toBe('SEARCH.FILTERS.DOCUMENT_CATEGORY.SELECTED');
        });

        it('should display whitelisted categories in the selection list', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            expect(selection).toBeTruthy();
            expect(selection?.length).toBe(5);

            const expectedOptions = ['SysFile', 'SpecialFile', 'SuperSpecialFile', 'SuperSpecialFolder', 'SysFolder'];
            const entries = selection?.entries() || [];
            for (const [i, element] of entries) {
                expect(await element.getFullText()).toEqual(expectedOptions[i]);
            }
        });

        it('should apply filtered category when apply button is clicked', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            await firstOption?.select();
            fixture.detectChanges();

            const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

            expect(component.selectedValue).toEqual(SELECTED_SYSFILE);
            expect(component.value).toBeFalsy();

            const applyFilterButton = await filterHarness.getApplyButton();
            expect(applyFilterButton).toBeTruthy();
            applyFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();
            expect(component.value).toEqual(SELECTED_SYSFILE);
            expect(component.selectedValue).toEqual(component.value);

            const selectedValue = await filteredAppliedPromise;
            expect(selectedValue?.filter).toEqual(component);

            component.clearFilter();
        });

        it('should clear the filter', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            await firstOption?.select();
            fixture.detectChanges();

            expect(component.selectedValue).toEqual(SELECTED_SYSFILE);
            expect(component.value).toBeFalsy();

            const applyFilterButton = await filterHarness.getApplyButton();
            expect(applyFilterButton).toBeTruthy();
            applyFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();
            await filterHarness.open();

            expect(await filterHarness.isOpen()).toBeTruthy();
            expect(component.value).toEqual(SELECTED_SYSFILE);
            expect(component.selectedValue).toEqual(component.value);

            const clearFilterButton = await filterHarness.getClearButton();
            expect(clearFilterButton).toBeTruthy();
            clearFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();
            expect(component.value).toBeFalsy();
            expect(component.selectedValue).toBeFalsy();
            expect(component.selectedValue).toEqual(component.value);
            expect(await firstOption?.isSelected()).toBeFalsy();
        });

        it('should select and deselect category when selected option changes', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            const secondOption = selection?.[1];
            await firstOption?.select();
            await secondOption?.select();
            fixture.detectChanges();

            expect(component.selectedValue).toEqual(MULTIPLE_SELECTION);
            expect(component.value).toBeFalsy();

            await firstOption?.deselect();
            await secondOption?.deselect();
            fixture.detectChanges();

            expect(component.selectedValue).toBeFalsy();
            expect(component.value).toBeFalsy();
        });

        it('should display a summary with selected categories', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            await firstOption?.select();
            fixture.detectChanges();

            const summary = await filterHarness.getSummary();
            expect(summary).toBeTruthy();
            const summaryItems = await summary?.getChips();
            expect(summaryItems?.length).toBe(1);
            expect(summaryItems?.[0]).toBeTruthy();
        });

        it('should deselect a category when removed from summary', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            await firstOption?.select();
            fixture.detectChanges();

            const summary = await filterHarness.getSummary();
            const summaryItems = await summary?.getChips();
            const summaryItem = summaryItems?.[0];
            expect(summaryItem).toBeTruthy();
            const removeButton = await summaryItem?.getRemoveButton();
            await removeButton?.click();
            fixture.detectChanges();

            expect(await firstOption?.isSelected()).toBeFalsy();
        });

        it('should display filtered categories when input is filled', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();
            getMockInput().search.emit('file');
            fixture.detectChanges();
            const selection = await filterHarness.getSelection();

            expect(selection).toBeTruthy();
            expect(selection?.length).toBe(3);

            const expectedOptions = ['SysFile', 'SpecialFile', 'SuperSpecialFile'];
            const entries = selection?.entries() || [];
            for (const [i, element] of entries) {
                expect(await element.getFullText()).toEqual(expectedOptions[i]);
            }
        });

        it('should clear search term when button is pressed', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            fixture.detectChanges();
            await fixture.whenStable();

            getMockInput().search.emit('file');

            fixture.detectChanges();
            await fixture.whenStable();

            expect((component as any).searchTerm).toBe('file');

            getMockInput().clear.emit();

            fixture.detectChanges();
            await fixture.whenStable();

            expect((component as any).searchTerm).toBe('');
        });

        it('should keep previously submitted value when overlay selection changes without applying it', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            const secondOption = selection?.[1];
            await firstOption?.select();
            fixture.detectChanges();

            const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

            expect(component.selectedValue).toEqual(SELECTED_SYSFILE);
            expect(component.value).toBeFalsy();

            const applyFilterButton = await filterHarness.getApplyButton();
            expect(applyFilterButton).toBeTruthy();
            applyFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();
            expect(component.value).toEqual(SELECTED_SYSFILE);
            expect(component.selectedValue).toEqual(component.value);

            const selectedValue = await filteredAppliedPromise;
            expect(selectedValue?.filter).toEqual(component);

            await filterHarness.open();
            await secondOption?.select();
            fixture.detectChanges();

            const backdrop = await filterHarness.getOverlayBackdrop();
            expect(backdrop).toBeTruthy();
            backdrop?.dispatchEvent('click');
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();
            expect(component.value).toEqual(SELECTED_SYSFILE);
            expect(component.selectedValue).toEqual(component.value);

            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeTruthy();
            expect(await firstOption?.isSelected()).toBeTruthy();
            expect(await secondOption?.isSelected()).toBeFalsy();
        });

        it('should populate filter with provided data', async () => {
            component.ngOnInit();

            expect(component.value).toBeFalsy();
            expect(component.selectedValue).toBeFalsy();

            component.populateWith(SELECTED_SYSFILE);
            fixture.detectChanges();

            expect(component.selectedValue).toEqual(component.value);
            expect(component.value).toEqual(SELECTED_SYSFILE);
        });

        it('should pass accessibility checks', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const selection = await filterHarness.getSelection();
            const firstOption = selection?.[0];
            await firstOption?.select();
            fixture.detectChanges();

            const res = await a11yReport('.hxp-search-filter-overlay');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });
    });

    describe('with no categories returned from the server', () => {
        beforeEach(() => {
            documentModelServiceSpy = jest.spyOn(mockModelApi, 'getModel').mockReturnValue(
                generateMockResponse({
                    data: { ...jestMocks.modelApi, primaryTypes: [] },
                })
            );

            fixture = TestBed.createComponent(DocumentCategorySearchFiltersComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('should display the no results view when no categories are present', async () => {
            component.ngOnInit();

            const filterHarness = await loader.getHarness(DocumentCategorySearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const noResults = await filterHarness.getNoResults();
            expect(noResults).toBeTruthy();
        });
    });
});
