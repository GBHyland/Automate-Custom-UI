/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MockComponents, MockProvider, MockService, ngMocks } from 'ng-mocks';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileTypeSearchFilterComponent } from './file-type-search-filter.component';
import { FileTypeSearchFilterService } from './file-type-search-filter.service';
import { FileTypeSearchFilterHarness } from './file-type-search-filter-harness';
import { FileTypeSearchFilterTreeComponent } from './tree/file-type-search-filter-tree.component';
import { take } from 'rxjs/operators';
import { FileTypeFlatNode } from './tree/file-type-search-filter-file-type-node';
import { ArrayToStringPipe } from './array-to-string.pipe';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { SearchFilterInputComponent } from '../../search-filter-input/search-filter-input.component';
import { getMockInput } from '../../search-filter-input/helpers';
import { SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';
import { TranslatePipe } from '@ngx-translate/core';

const EXPECTED_VIOLATIONS: Array<{ [violationId: string]: number }> | undefined = [];

const fileTypeMocks: FileTypeFlatNode[] = [
    {
        id: 'documents/portable-document-format',
        label: 'Portable Document Format',
        level: 1,
        expandable: false,
        extensions: ['pdf'],
        mimeTypes: ['application/pdf'],
        mimeTypeIcon: 'application/pdf',
    },
    {
        id: 'documents/presentation',
        label: 'Presentation',
        level: 1,
        expandable: false,
        extensions: ['ppt', 'pptx'],
        mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        mimeTypeIcon: 'application/vnd.ms-powerpoint',
    },
    {
        id: 'documents/spreadsheet',
        label: 'Spreadsheet',
        level: 1,
        expandable: false,
        extensions: ['xls', 'xlsx'],
        mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        mimeTypeIcon: 'application/vnd.ms-excel',
    },
];

const getFileTypeTree = () => ngMocks.find<FileTypeSearchFilterTreeComponent>('hxp-file-type-search-filter-tree').componentInstance;

describe('FileTypeSearchFilterComponent', () => {
    let loader: HarnessLoader;
    let component: FileTypeSearchFilterComponent;
    let fixture: ComponentFixture<FileTypeSearchFilterComponent>;
    let searchFilterValueService: SearchFilterValueService;

    const mockFileTypeSearchFilterService = MockService(FileTypeSearchFilterService);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslatePipe,
                ArrayToStringPipe,
                CommonModule,
                FormsModule,
                NoopAnimationsModule,
                NoopTranslateModule,
                OverlayModule,
                MatButtonModule,
                MatIconTestingModule,
                MatIconModule,
                ReactiveFormsModule,
                SearchFilterContainerComponent,
                MockComponents(FileTypeSearchFilterTreeComponent, SearchFilterInputComponent),
                FileTypeSearchFilterComponent,
            ],
            providers: [MockProvider(FileTypeSearchFilterService, mockFileTypeSearchFilterService)],
        }).compileComponents();

        searchFilterValueService = TestBed.inject(SearchFilterValueService);
        fixture = TestBed.createComponent(FileTypeSearchFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(async () => {
        // We need this to ensure the overlay is removed from the DOM
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        if (await filterHarness?.isOpen()) {
            const clearFilterButton = await filterHarness.getClearButton();
            await clearFilterButton?.click();
            fixture.detectChanges();
            await fixture.whenStable();
        }
    });

    it('should display the file type search filter', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('SEARCH.FILTERS.FILE_TYPE.LABEL');
    });

    it('should open the file type filter and display the overlay content', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(await filterHarness.isOpen()).toBeTruthy();

        expect(getFileTypeTree()).toBeTruthy();

        const clearFilterButton = await filterHarness.getClearButton();

        expect(getMockInput()).toBeTruthy();
        expect(await clearFilterButton?.isDisabled()).toBeTruthy();
    });

    it('should allow multiple file type selection in the tree', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toEqual(component.selectedValue);

        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBe(true);
        expect(getFileTypeTree()).toBeTruthy();

        getFileTypeTree().selectedFileTypes.emit(fileTypeMocks);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedValue?.values?.length).toEqual(3);

        const filterSummaryItems = await filterHarness.getSummaryItems();

        expect(filterSummaryItems).toBeTruthy();
        expect(filterSummaryItems?.length).toEqual(3);

        const expectedFileTypes = ['Portable Document Format (.pdf)', 'Presentation (.ppt, .pptx)', 'Spreadsheet (.xls, .xlsx)'];

        if (filterSummaryItems) {
            for (const [i, filterSummaryItem] of filterSummaryItems.entries()) {
                expect(await filterSummaryItem.getText()).toEqual(expectedFileTypes[i]);
            }
        }

        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(component.selectedValue).toBeTruthy();
        expect(component.value).toEqual(component.selectedValue);

        const appliedValue = await filteredAppliedPromise;
        expect(appliedValue?.filter).toEqual(component);
        expect(appliedValue?.value).toEqual(component.value);
    });

    it('should clear filter term when clear from input is emitted', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        getMockInput().search.emit('pdf');

        fixture.detectChanges();
        await fixture.whenStable();

        expect((component as any).searchTerm).toBe('pdf');

        getMockInput().clear.emit();

        fixture.detectChanges();
        await fixture.whenStable();

        expect((component as any).searchTerm).toBe('');
    });

    it('should keep previously submitted value when overlay selection changes without applying it', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

        getFileTypeTree().selectedFileTypes.emit([fileTypeMocks[0]]);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedValue?.values?.length).toEqual(1);

        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();

        await applyFilterButton?.click();

        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(component.value);

        const selectedValue = await filteredAppliedPromise;

        expect(selectedValue?.filter).toEqual(component);

        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        getFileTypeTree().selectedFileTypes.emit(fileTypeMocks);

        fixture.detectChanges();
        await fixture.whenStable();

        const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        expect(backdrop).toBeTruthy();

        const event = new MouseEvent('click');
        backdrop.dispatchEvent(event);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(component.value);

        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const filterSummaryItems = await filterHarness.getSummaryItems();

        expect(filterSummaryItems).toBeTruthy();
        expect(filterSummaryItems?.length).toEqual(1);
        expect(component.selectedValue?.values?.length).toEqual(1);
        if (filterSummaryItems) {
            expect(await filterSummaryItems[0].getText()).toEqual('Portable Document Format (.pdf)');
        }
    });

    it('should pass accessibility checks', async () => {
        const filterHarness = await loader.getHarness(FileTypeSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        getFileTypeTree().selectedFileTypes.emit([fileTypeMocks[0]]);

        fixture.detectChanges();
        await fixture.whenStable();

        const applyFilterButton = await filterHarness.getApplyButton();

        await applyFilterButton?.click();

        fixture.detectChanges();

        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        getFileTypeTree().selectedFileTypes.emit([fileTypeMocks[1]]);

        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('.hxp-search-filter-overlay');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
