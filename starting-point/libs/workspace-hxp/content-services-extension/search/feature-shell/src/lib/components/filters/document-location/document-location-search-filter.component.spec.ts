/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MockComponents, MockProvider, MockService, ngMocks } from 'ng-mocks';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { DocumentService, SearchFilterValueService, SearchService } from '@alfresco/adf-hx-content-services/services';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { of, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocumentLocationSearchFilterComponent } from './document-location-search-filter.component';
import { DocumentLocationSearchFilterService } from './document-location-search-filter.service';
import { DocumentLocationSearchFilterHarness } from './document-location-search-filter-harness';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { getMockInput, SearchFilterContainerComponent, SearchFilterInputComponent } from '@alfresco/adf-hx-content-services/ui';
import { TranslatePipe } from '@ngx-translate/core';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'scrollable-region-focusable': 1 }];

describe('DocumentLocationSearchFilterComponent', () => {
    let loader: HarnessLoader;
    let component: DocumentLocationSearchFilterComponent;
    let fixture: ComponentFixture<DocumentLocationSearchFilterComponent>;
    let searchFilterValueService: SearchFilterValueService;

    const mockDocumentService: DocumentService = MockService(DocumentService);
    const mockDocumentLocationSearchFilterService = MockService(DocumentLocationSearchFilterService);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslatePipe,
                NoopAnimationsModule,
                NoopTranslateModule,
                OverlayModule,
                MatButtonModule,
                MatTooltipModule,
                MatIconTestingModule,
                MatIconModule,
                MimeTypeIconComponent,
                SearchFilterContainerComponent,
                MockComponents(HxpWorkspaceDocumentTreeComponent, SearchFilterInputComponent),
                DocumentLocationSearchFilterComponent,
            ],
            providers: [
                DatePipe,
                MockProvider(DocumentService, mockDocumentService),
                MockProvider(SearchService),
                MockProvider(DocumentLocationSearchFilterService, mockDocumentLocationSearchFilterService),
            ],
        })
            .overrideProvider(DocumentLocationSearchFilterService, { useValue: mockDocumentLocationSearchFilterService })
            .compileComponents();

        mockDocumentService.documentDeleted$ = new Subject();
        mockDocumentService.documentCreated$ = new Subject();
        mockDocumentService.documentLoaded$ = new Subject();

        spyOn(mockDocumentService, 'getFolderChildren')
            .withArgs(ROOT_DOCUMENT.sys_id)
            .and.returnValue(
                of({
                    documents: [...mocks.nestedDocumentAncestors],
                    limit: 10,
                    offset: 0,
                    totalCount: 2,
                })
            )
            .withArgs(mocks.folderDocument.sys_id)
            .and.returnValue(
                of({
                    documents: [...mocks.nestedDocumentAncestors],
                    limit: 10,
                    offset: 0,
                    totalCount: 2,
                })
            );

        spyOn(mockDocumentService, 'getAncestors')
            .withArgs(mocks.folderDocument.sys_id)
            .and.returnValue(of([ROOT_DOCUMENT, ...mocks.nestedDocumentAncestors2]))
            .withArgs(mocks.nestedDocument.sys_id)
            .and.returnValue(of([ROOT_DOCUMENT, ...mocks.nestedDocumentAncestors2]));

        spyOn(mockDocumentLocationSearchFilterService, 'searchDocuments')
            .withArgs('Folder 1')
            .and.returnValue(of([...mocks.nestedDocumentAncestors]))
            .withArgs('Nested Folder 1')
            .and.returnValue(of([...mocks.nestedDocumentAncestors]));

        searchFilterValueService = TestBed.inject(SearchFilterValueService);
        fixture = TestBed.createComponent(DocumentLocationSearchFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    // We need this to ensure the overlay is removed from the DOM
    afterEach(async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        if (await filterHarness?.isOpen()) {
            const clearFilterButton = await filterHarness.getClearButton();
            await clearFilterButton?.click();
            fixture.detectChanges();
            await fixture.whenStable();
        }
    });

    it('should display the document location filter search', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label.text()).toBe('SEARCH.FILTERS.DOCUMENT_LOCATION.LABEL');
    });

    it('should open the search in filter and display the overlay content', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const documentTree = await filterHarness.documentTree();
        const loadingSpinner = await filterHarness.loadingSpinner();
        const resultsList = await filterHarness.getResultsList();

        expect(documentTree).toBeTruthy();
        expect(loadingSpinner).toBeFalsy();
        expect(resultsList).toBeFalsy();

        const clearFilterButton = await filterHarness.getClearButton();

        expect(getMockInput()).toBeTruthy();
        expect(await clearFilterButton?.isDisabled()).toBeTruthy();
    });

    it('should allow multiple document selection in the document tree', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toEqual(component.selectedValue);

        const applyFilterButton = await filterHarness.getApplyButton();
        const documentTree = await filterHarness.documentTree();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTrue();
        expect(documentTree).toBeTruthy();

        const mockDocumentTree = ngMocks.find<HxpWorkspaceDocumentTreeComponent>('hxp-workspace-document-tree').componentInstance;

        mockDocumentTree.selectedDocument.emit(mocks.folderDocument);
        mockDocumentTree.selectedDocument.emit(mocks.nestedDocument);
        mockDocumentTree.selectedDocument.emit(mocks.fileDocument);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedValue.values.length).toEqual(3);

        const filterSummaryItems = await filterHarness.getSummaryItems();

        expect(filterSummaryItems).toBeTruthy();
        expect(filterSummaryItems?.length).toEqual(3);

        const expectedDocumentTitles = ['Folder 1', 'Nested Folder 1', 'File 1'];

        if (filterSummaryItems) {
            for (const [i, filterSummaryItem] of filterSummaryItems.entries()) {
                expect(await filterSummaryItem.getText()).toEqual(expectedDocumentTitles[i]);
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

    it('should display document result list based on the search term', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();
        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toEqual(component.selectedValue);

        let documentTree = await filterHarness.documentTree();
        let resultsList = await filterHarness.getResultsList();
        let applyFilterButton = await filterHarness.getApplyButton();

        expect(documentTree).toBeTruthy();
        expect(resultsList).toBeFalsy();
        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTrue();

        getMockInput().search.emit('Folder 1');

        fixture.detectChanges();
        await fixture.whenStable();

        resultsList = await filterHarness.getResultsList();

        expect(resultsList).toBeTruthy();

        documentTree = await filterHarness.documentTree();

        expect(documentTree).toBeFalsy();

        const resultsListSelection = await filterHarness.getResultsListSelection();

        expect(resultsListSelection).toHaveSize(2);

        await filterHarness.selectItemsResultsList();

        fixture.detectChanges();
        await fixture.whenStable();

        const filterSummaryItems = await filterHarness.getSummaryItems();

        expect(filterSummaryItems).toBeTruthy();
        expect(filterSummaryItems?.length).toEqual(2);

        const expectedDocumentTitles = ['Folder 1', 'Nested Folder 1'];

        if (filterSummaryItems) {
            for (const [i, filterSummaryItem] of filterSummaryItems.entries()) {
                expect(await filterSummaryItem.getText()).toEqual(expectedDocumentTitles[i]);
            }
        }

        const selectedResultsItems = await filterHarness.getResultsListSelection();

        expect(selectedResultsItems).toHaveSize(2);

        getMockInput().prefixClick.emit();

        resultsList = await filterHarness.getResultsList();
        documentTree = await filterHarness.documentTree();
        applyFilterButton = await filterHarness.getApplyButton();

        expect(await applyFilterButton?.isDisabled()).toBeFalsy();
        expect(resultsList).toBeFalsy();
        expect(documentTree).toBeTruthy();

        await applyFilterButton?.focus();
        await applyFilterButton?.click();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedValue).toBeTruthy();
        expect(component.value).toEqual(component.selectedValue);

        const appliedValue = await filteredAppliedPromise;
        expect(appliedValue?.filter).toEqual(component);
        expect(appliedValue?.value).toEqual(component.value);
    });

    it('should allow combining document selection from the document tree and result list', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

        const mockDocumentTree = ngMocks.find<HxpWorkspaceDocumentTreeComponent>('hxp-workspace-document-tree').componentInstance;

        mockDocumentTree.selectedDocument.emit(mocks.folderDocument);

        fixture.detectChanges();
        await fixture.whenStable();

        const filterSummaryItems = await filterHarness.getSummaryItems();

        expect(component.selectedValue.values.length).toEqual(1);
        if (filterSummaryItems) {
            expect(await filterSummaryItems[0].getText()).toEqual('Folder 1');
        }

        getMockInput().search.emit('Folder 1');

        fixture.detectChanges();
        await fixture.whenStable();

        const resultsList = await filterHarness.getResultsList();

        expect(resultsList).toBeTruthy();

        let resultsListSelection = await filterHarness.getResultsListSelection();

        if (resultsListSelection) {
            expect(await resultsListSelection[0].isSelected()).toBeTrue();
            expect(await resultsListSelection[1].isSelected()).toBeFalse();
        }

        await filterHarness.selectItemsResultsList();
        resultsListSelection = await filterHarness.getResultsListSelection();

        expect(resultsListSelection).toHaveSize(2);

        if (resultsListSelection) {
            expect(await resultsListSelection[0].isSelected()).toBeTrue();
            expect(await resultsListSelection[1].isSelected()).toBeTrue();
        }

        fixture.detectChanges();
        await fixture.whenStable();

        const applyFilterButton = await filterHarness.getApplyButton();
        await applyFilterButton?.focus();
        await applyFilterButton?.click();

        expect(component.selectedValue.values.length).toEqual(2);
        expect(component.selectedValue).toBeTruthy();
        expect(component.value).toEqual(component.selectedValue);

        const appliedValue = await filteredAppliedPromise;
        expect(appliedValue?.filter).toEqual(component);
        expect(appliedValue?.value).toEqual(component.value);
    });

    it('should keep previously submitted value when overlay selection changes without applying it', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

        const mockDocumentTree = ngMocks.find<HxpWorkspaceDocumentTreeComponent>('hxp-workspace-document-tree').componentInstance;
        mockDocumentTree.selectedDocument.emit(mocks.folderDocument);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedValue.values.length).toEqual(1);

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

        mockDocumentTree.selectedDocument.emit(mocks.nestedDocument);

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
        expect(component.selectedValue.values.length).toEqual(1);
        if (filterSummaryItems) {
            expect(await filterSummaryItems[0].getText()).toEqual('Folder 1');
        }
    });

    it('should pass accessibility checks', async () => {
        const filterHarness = await loader.getHarness(DocumentLocationSearchFilterHarness);
        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        const mockDocumentTree = ngMocks.find<HxpWorkspaceDocumentTreeComponent>('hxp-workspace-document-tree').componentInstance;
        mockDocumentTree.selectedDocument.emit(mocks.folderDocument);

        fixture.detectChanges();
        await fixture.whenStable();

        const applyFilterButton = await filterHarness.getApplyButton();

        await applyFilterButton?.click();

        fixture.detectChanges();

        await filterHarness.open();

        fixture.detectChanges();
        await fixture.whenStable();

        mockDocumentTree.selectedDocument.emit(mocks.nestedDocument);

        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('.hxp-search-filter-overlay');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
