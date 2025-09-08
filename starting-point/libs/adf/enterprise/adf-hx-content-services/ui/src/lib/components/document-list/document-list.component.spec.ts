/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CheckboxHarnessUtils, PaginatorHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { DataColumnComponent, DataColumnListComponent, NoopTranslateModule, ObjectDataColumn } from '@alfresco/adf-core';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    ContextMenuActionsService,
    DocumentCacheService,
    DocumentFetchOptions,
    DocumentFetchResults,
    DocumentService,
    DocumentUpdateInfo,
    IsSingleDocumentWithMainBlobService,
    UserService,
} from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document, User } from '@hylandsoftware/hxcs-js-client';
import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { Observable, Subject, of } from 'rxjs';
import { HxpDocumentListComponent } from './document-list.component';

// https://hyland.atlassian.net/browse/HXCS-1815
const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [
    { 'aria-required-children': 3 },
    { 'aria-valid-attr-value': 1 },
    { label: 1 },
    { 'nested-interactive': 2 },
];

jest.mock('@hxp/workspace-hxp/shared/testing', () => {
    const testing = jest.requireActual('@hxp/workspace-hxp/shared/testing');
    return {
        ...testing,
        a11yReport: async () => ({
            violations: EXPECTED_VIOLATIONS,
        }),
    };
});

@Component({
    selector: 'hxp-test-component',
    template: `
        <hxp-document-list #documentList [documents]="documents">
            <data-columns>
                <data-column [sortable]="false" key="icon" title="Icon"/>
                <data-column [sortable]="true" key="sys_title" title="Title"/>
                <data-column [sortable]="true" key="sys_created" title="Created"/>
                <data-column [sortable]="true" key="sys_modified" title="Modified"/>
            </data-columns>
        </hxp-document-list>
    `,
    standalone: true,
    imports: [CommonModule, HxpDocumentListComponent, DataColumnListComponent, DataColumnComponent],
})
class TestComponent {
    documents: Document[] = [];

    @ViewChild('documentList')
    documentList!: HxpDocumentListComponent;
}

const mockDocumentService: DocumentService = MockService(DocumentService);
const mockUserService: UserService = MockService(UserService);

const mockDocumentCacheService = {
    getDocument: () => of(jestMocks.folderDocument),
};

const defaultSchema = [
    new ObjectDataColumn({
        key: 'icon',
        type: 'image',
        title: 'Icon',
        sortable: false,
    }),
    new ObjectDataColumn({
        key: 'sys_title',
        type: 'text',
        title: 'DOCUMENT_LIST.COLUMNS.TITLE',
        sortable: true,
    }),
];

describe('DocumentListComponent', () => {
    let isSingleDocumentWithMainBlobServiceSpy: jest.Mocked<IsSingleDocumentWithMainBlobService>;
    let getAllChildrenSpy: jest.SpyInstance<
        Observable<DocumentFetchResults>,
        [parentId: string, options?: DocumentFetchOptions | undefined, repositoryId?: string | undefined],
        any
    >;

    let documentList: HxpDocumentListComponent;
    let fixture: ComponentFixture<HxpDocumentListComponent>;

    const documentUpdated$ = new Subject<DocumentUpdateInfo>();
    const reloadSubject = new Subject<void>();

    let mockActivatedRoute: any;

    beforeEach(() => {
        mockActivatedRoute = {
            url: new Subject(),
        };
        isSingleDocumentWithMainBlobServiceSpy = {
            validate: jest.fn(),
        } as any;

        TestBed.configureTestingModule({
            imports: [HxpDocumentListComponent, TestComponent, NoopAnimationsModule, NoopTranslateModule, RouterTestingModule],
            providers: [
                MockProvider(DocumentService, mockDocumentService),
                { provide: UserService, useValue: mockUserService },
                MockProvider(ContextMenuActionsService),
                {
                    provide: IsSingleDocumentWithMainBlobService,
                    useValue: isSingleDocumentWithMainBlobServiceSpy,
                },
                MockProvider(DocumentCacheService, MockService(DocumentCacheService, mockDocumentCacheService)),
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
        });

        mockDocumentService.documentRequestReload$ = reloadSubject.asObservable();
        mockDocumentService.documentDeleted$ = new Subject();
        mockDocumentService.documentCreated$ = new Subject();
        mockDocumentService.documentLoaded$ = new Subject();
        mockDocumentService.documentUpdated$ = documentUpdated$.asObservable();

        ngMocks.autoSpy('jest');
        getAllChildrenSpy = jest.spyOn(mockDocumentService, 'getAllChildren').mockImplementation((...args) => {
            switch (args) {
                case [ROOT_DOCUMENT.sys_id, { limit: 10, offset: 0, sort: [] }]: {
                    return of({ documents: [...jestMocks.nestedDocumentAncestors].reverse(), limit: 10, offset: 0, totalCount: 2 });
                }
                case [jestMocks.nestedDocument.sys_id, { limit: 10, offset: 0, sort: [] }]: {
                    return of({ documents: [...jestMocks.nestedDocumentAncestors2].reverse(), limit: 10, offset: 0, totalCount: 2 });
                }
                case [ROOT_DOCUMENT.sys_id, { limit: 10, offset: 0, sort: ['sys_title asc'] }]: {
                    return of({ documents: [...jestMocks.nestedDocumentAncestors], limit: 10, offset: 0, totalCount: 2 });
                }
                case [jestMocks.folderDocument.sys_id, { limit: 10, offset: 0, sort: [] }]: {
                    return of({ documents: [], limit: 10, offset: 0, totalCount: 0 });
                }
                case [jestMocks.folderDocument.sys_id, { limit: 10, offset: 0, sort: ['sys_title asc'] }]: {
                    return of({ documents: [], limit: 10, offset: 0, totalCount: 0 });
                }
                default: {
                    return of({ documents: [], limit: 10, offset: 0, totalCount: 0 });
                }
            }
        });

        jest.spyOn(mockUserService, 'resolveUser').mockReturnValue(of({ firstName: 'test', lastName: 'user' } as Partial<User>));

        jest.spyOn(mockDocumentService, 'getDocumentById').mockReturnValue(of(jestMocks.folderDocument));

        fixture = TestBed.createComponent(HxpDocumentListComponent);
        documentList = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        getAllChildrenSpy.mockReset();
    });

    it('should render an empty list when the current document does not have children', () => {
        expect(documentList).toBeTruthy();
        expect(getAllChildrenSpy).not.toHaveBeenCalled();
        expect(documentList.documents).toEqual([]);

        let noContent = fixture.debugElement.query(By.css('adf-empty-content'));

        expect(noContent).toBeTruthy();

        documentList.documents = [];
        documentList.ngOnChanges();
        fixture.detectChanges();
        noContent = fixture.debugElement.query(By.css('adf-empty-content'));

        expect(noContent).toBeTruthy();
    });

    it('should render a list with children documents', () => {
        const datatable = fixture.debugElement.query(By.css('adf-datatable'));

        expect(datatable).toBeTruthy();

        const datatableInstance = datatable.componentInstance;

        expect(datatableInstance.rows).toHaveLength(0);

        let rows = fixture.debugElement.queryAll(By.css('adf-datatable-row'));

        expect(rows).toBeTruthy();
        expect(rows).toHaveLength(0);

        documentList.documents = jestMocks.nestedDocumentAncestors;
        documentList.ngOnChanges();
        fixture.detectChanges();

        expect(datatableInstance.rows).toBeTruthy();
        expect(datatableInstance.rows).toHaveLength(2);

        rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

        expect(rows).toBeTruthy();
        expect(rows).toHaveLength(2);
    });

    it('should select multiple documents in the list', async () => {
        documentList.documents = jestMocks.nestedDocumentAncestors;
        documentList.ngOnChanges();
        fixture.detectChanges();
        const rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

        expect(rows).toHaveLength(2);

        let checkboxList = await CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: false,
                ancestor: '.adf-datatable-body',
            },
        });

        expect(checkboxList.length).toBe(2);

        await checkboxList[0].check();
        checkboxList = await CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: false,
                ancestor: '.adf-datatable-body',
            },
        });

        expect(checkboxList.length).toBe(1);
    });

    it('should select all the documents in the list', async () => {
        documentList.documents = jestMocks.nestedDocumentAncestors;
        documentList.ngOnChanges();
        fixture.detectChanges();
        const rows = fixture.debugElement.queryAll(By.css('adf-datatable-row'));

        expect(rows).toHaveLength(3);

        const unselectedCheckboxList = await CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: false,
            },
        });

        expect(unselectedCheckboxList.length).toBe(3);

        await unselectedCheckboxList[0].check();
        const selectedCheckboxList = await CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: true,
            },
        });

        expect(selectedCheckboxList.length).toBe(3);
    });

    it('should emit event when selection changes', async () => {
        jest.spyOn(documentList.selectedDocuments, 'emit').mockImplementation(() => {});

        expect(documentList.selectedDocuments.emit).not.toHaveBeenCalled();

        (documentList as any).parentDocument = ROOT_DOCUMENT;
        documentList.documents = jestMocks.nestedDocumentAncestors;
        documentList.ngOnChanges();
        fixture.detectChanges();

        expect(documentList.selectedDocuments.emit).not.toHaveBeenCalled();

        const rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

        expect(rows).toBeTruthy();
        expect(rows).toHaveLength(2);

        await CheckboxHarnessUtils.toggleCheckbox({
            fixture,
            checkboxFilters: {
                ancestor: '.adf-datatable-body',
            },
        });

        expect(documentList.selectedDocuments.emit).toHaveBeenCalledWith([jestMocks.nestedDocumentAncestors[0]]);
    });

    it('should not render paginator when documents is Null', async () => {
        expect(getAllChildrenSpy).not.toHaveBeenCalled();
        expect(documentList.documents).toEqual([]);

        const paginator = await PaginatorHarnessUtils.getAllPaginator({ fixture, paginatorFilters: { ancestor: 'hxp-document-list-paginator' } });

        expect(paginator.length).toBe(0);
    });

    describe('with Input() schema', () => {
        it('should render the default columns', () => {
            documentList.documents = jestMocks.nestedDocumentAncestors;
            documentList.schema = [...defaultSchema];
            documentList.ngOnChanges();
            fixture.detectChanges();
            const headerRow = fixture.debugElement.query(By.css('.adf-datatable-header adf-datatable-row'));

            expect(headerRow).toBeTruthy();

            const headerColumns = headerRow.queryAll(By.css('[role="columnheader"]'));

            expect(headerColumns).toHaveLength(2);

            const iconCol = headerColumns[0].query(By.css('[data-automation-id="auto_header_content_id_icon"]'));

            expect(iconCol).toBeTruthy();

            const titleCol = headerColumns[1].query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

            expect(titleCol).toBeTruthy();
            expect(titleCol.nativeElement.textContent.trim()).toEqual('DOCUMENT_LIST.COLUMNS.TITLE');
        });

        it('should render additional columns when pass it through DataColumn', () => {
            documentList.documents = jestMocks.nestedDocumentAncestors;
            documentList.schema = [
                new ObjectDataColumn({
                    key: 'icon',
                    type: 'image',
                    title: 'Icon',
                    sortable: false,
                }),
                new ObjectDataColumn({
                    key: 'sys_title',
                    type: 'text',
                    title: 'DOCUMENT_LIST.COLUMNS.TITLE',
                    sortable: true,
                }),
                new ObjectDataColumn({
                    key: 'fakeFileSize',
                    type: 'text',
                    title: 'FAKE_TITLE_SIZE',
                    sortable: true,
                }),
                new ObjectDataColumn({
                    key: 'fakeLastModified',
                    type: 'text',
                    title: 'FAKE_TITLE_LAST_MODIFIED',
                    sortable: true,
                }),
                new ObjectDataColumn({
                    key: 'fakeLocation',
                    type: 'text',
                    title: 'FAKE_TITLE_LOCATION',
                    sortable: true,
                }),
                new ObjectDataColumn({
                    key: 'fakeDocumentCategory',
                    type: 'text',
                    title: 'FAKE_TITLE_DOCUMENT_CATEGORY',
                    sortable: true,
                }),
            ];
            documentList.ngOnChanges();
            fixture.detectChanges();
            const headerRow = fixture.debugElement.query(By.css('.adf-datatable-header adf-datatable-row'));

            expect(headerRow).toBeTruthy();

            const headerColumns = headerRow.queryAll(By.css('[role="columnheader"]'));

            expect(headerColumns).toHaveLength(6);

            const iconCol = headerColumns[0].query(By.css('[data-automation-id="auto_header_content_id_icon"]'));

            expect(iconCol).toBeTruthy();

            const titleCol = headerColumns[1].query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

            expect(titleCol).toBeTruthy();
            expect(titleCol.nativeElement.textContent.trim()).toEqual('DOCUMENT_LIST.COLUMNS.TITLE');

            const sizeCol = headerColumns[2].query(By.css('[data-automation-id="auto_header_content_id_fakeFileSize"]'));

            expect(sizeCol).toBeTruthy();
            expect(sizeCol.nativeElement.textContent.trim()).toEqual('FAKE_TITLE_SIZE');

            const createdCol = headerColumns[3].query(By.css('[data-automation-id="auto_header_content_id_fakeLastModified"]'));

            expect(createdCol).toBeTruthy();
            expect(createdCol.nativeElement.textContent.trim()).toEqual('FAKE_TITLE_LAST_MODIFIED');

            const modifiedCol = headerColumns[4].query(By.css('[data-automation-id="auto_header_content_id_fakeLocation"]'));

            expect(modifiedCol).toBeTruthy();
            expect(modifiedCol.nativeElement.textContent.trim()).toEqual('FAKE_TITLE_LOCATION');

            const parentPathCol = headerColumns[5].query(By.css('[data-automation-id="auto_header_content_id_fakeDocumentCategory"]'));

            expect(parentPathCol).toBeTruthy();
            expect(parentPathCol.nativeElement.textContent.trim()).toEqual('FAKE_TITLE_DOCUMENT_CATEGORY');
        });

        it('should update document order on column sort', () => {
            documentList.documents = jestMocks.nestedDocumentAncestors;
            documentList.schema = [...defaultSchema];
            documentList.ngOnChanges();
            fixture.detectChanges();
            getAllChildrenSpy.mockReset();
            let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

            expect(rows).toBeTruthy();
            expect(rows).toHaveLength(2);

            const datatable = fixture.debugElement.query(By.css('adf-datatable'));
            const datatableInstance = datatable.componentInstance;

            expect(datatable).toBeTruthy();
            expect(datatableInstance.rows).toHaveLength(2);

            let documentTitles = datatableInstance.rows.map((doc: Document) => doc.sys_title);
            let defaultDocumentTitles = jestMocks.nestedDocumentAncestors.map((doc) => doc.sys_title);
            let textContent = rows.map((row) =>
                row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim()
            );

            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(textContent).toEqual(defaultDocumentTitles);

            const titleHeaderCell = datatable.query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

            expect(titleHeaderCell).toBeTruthy();

            titleHeaderCell.nativeElement.click();
            documentList.ngOnChanges();
            fixture.detectChanges();
            documentTitles = datatableInstance.rows.map((doc: Document) => doc.sys_title);
            defaultDocumentTitles = jestMocks.nestedDocumentAncestors.map((doc) => doc.sys_title);
            rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            textContent = rows.map((row) =>
                row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim()
            );

            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(textContent).toEqual(defaultDocumentTitles);
        });

        it('should reset selection when the content changes', async () => {
            documentList.documents = jestMocks.nestedDocumentAncestors;
            documentList.schema = [...defaultSchema];
            documentList.ngOnChanges();
            fixture.detectChanges();
            let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

            expect(rows).toHaveLength(2);

            const datatable = fixture.debugElement.query(By.css('adf-datatable'));

            expect(datatable).toBeTruthy();

            let documentTitles = datatable.componentInstance.rows.map((doc: Document) => doc.sys_title);
            let defaultDocumentTitles = jestMocks.nestedDocumentAncestors.map((doc) => doc.sys_title);

            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(
                rows.map((row) => row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim())
            ).toEqual(defaultDocumentTitles);

            await CheckboxHarnessUtils.toggleCheckbox({ fixture });
            documentList.documents = jestMocks.nestedDocumentAncestors2;
            documentList.schema = [...defaultSchema];
            documentList.ngOnChanges();
            fixture.detectChanges();
            documentTitles = datatable.componentInstance.rows.map((doc: Document) => doc.sys_title);
            defaultDocumentTitles = jestMocks.nestedDocumentAncestors2.map((doc) => doc.sys_title);
            rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

            expect(rows).toHaveLength(2);
            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(
                rows.map((row) => row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim())
            ).toEqual(defaultDocumentTitles);

            const checkboxList = await CheckboxHarnessUtils.getAllCheckboxes({
                fixture,
                checkboxFilters: {
                    checked: true,
                },
            });

            expect(checkboxList.length).toBe(0);
        });
        // To avoid blocking again the upstream i'll comment this test BUT this is breaking due to a recent change for the visibility of the method onShowRowContextMenu
        // it('should open context menu and select the row when when right clicked on row menu', () => {
        //     documentList.documents = mocks.nestedDocumentAncestors;
        //     documentList.schema = [...defaultSchema];
        //     fixture.detectChanges();
        //     const mockEvent: MouseEvent = new MouseEvent('contextmenu', {bubbles: true});
        //     spyOn(documentList, 'onShowRowContextMenu');
        //     const rightClickEl = fixture.nativeElement.querySelector(
        //         '[data-automation-id="text_Nested Folder 1"]'
        //     );
        //     rightClickEl.dispatchEvent(mockEvent);
        //     fixture.detectChanges();

        //     expect(documentList.onShowRowContextMenu).toHaveBeenCalled();

        //     spyOn(documentList.selectedDocuments, 'emit');
        //     documentList.onShowContextMenu(mockEvent);

        //     expect(documentList.selectedDocuments.emit).toHaveBeenCalled();
        // });

        it('should pass accessibility checks', async () => {
            expect(documentList).toBeTruthy();

            documentList.documents = jestMocks.nestedDocumentAncestors;
            documentList.schema = [...defaultSchema];
            documentList.ngOnChanges();
            fixture.detectChanges();
            const res = await a11yReport('adf-datatable');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });
    });

    describe('by providing DataColumns in the template', () => {
        let testComponent: TestComponent;
        let testFixture: ComponentFixture<TestComponent>;

        beforeEach(async () => {
            testFixture = TestBed.createComponent(TestComponent);
            testFixture.detectChanges();
            await fixture.whenStable();
            testComponent = testFixture.componentInstance;
        });

        it('should not render paginator when the current document does not have children', async () => {
            testComponent.documents = [];
            testFixture.detectChanges();
            const paginators = await PaginatorHarnessUtils.getAllPaginator({ fixture });

            expect(paginators.length).toBe(0);
        });

        it('should render additional columns when pass it through DataColumn', () => {
            testComponent.documents = jestMocks.nestedDocumentAncestors;
            testFixture.detectChanges();
            const headerRow = testFixture.debugElement.query(By.css('.adf-datatable-header adf-datatable-row'));

            expect(headerRow).toBeTruthy();

            const headerColumns = headerRow.queryAll(By.css('[role="columnheader"]'));

            expect(headerColumns).toHaveLength(4);

            const iconCol = headerColumns[0].query(By.css('[data-automation-id="auto_header_content_id_icon"]'));

            expect(iconCol).toBeTruthy();

            const titleCol = headerColumns[1].query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

            expect(titleCol).toBeTruthy();
            expect(titleCol.nativeElement.textContent.trim()).toEqual('Title');

            const sizeCol = headerColumns[2].query(By.css('[data-automation-id="auto_header_content_id_sys_created"]'));

            expect(sizeCol).toBeTruthy();
            expect(sizeCol.nativeElement.textContent.trim()).toEqual('Created');

            const createdCol = headerColumns[3].query(By.css('[data-automation-id="auto_header_content_id_sys_modified"]'));

            expect(createdCol).toBeTruthy();
            expect(createdCol.nativeElement.textContent.trim()).toEqual('Modified');
        });

        it('should update document order on column sort', () => {
            testComponent.documents = jestMocks.nestedDocumentAncestors;
            testFixture.detectChanges();
            getAllChildrenSpy.mockReset();
            let rows = testFixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

            expect(rows).toBeTruthy();
            expect(rows).toHaveLength(2);

            const datatable = testFixture.debugElement.query(By.css('adf-datatable'));
            const datatableInstance = datatable.componentInstance;

            expect(datatable).toBeTruthy();
            expect(datatableInstance.rows).toHaveLength(2);

            let documentTitles = datatableInstance.rows.map((doc: Document) => doc.sys_title);
            let defaultDocumentTitles = jestMocks.nestedDocumentAncestors.map((doc) => doc.sys_title);
            let textContent = rows.map((row) => row.query(By.css('.adf-datatable-cell[title="Title"]')).nativeElement.textContent.trim());

            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(textContent).toEqual(defaultDocumentTitles);

            const titleHeaderCell = datatable.query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

            expect(titleHeaderCell).toBeTruthy();

            titleHeaderCell.nativeElement.click();
            testFixture.detectChanges();
            documentTitles = datatableInstance.rows.map((doc: Document) => doc.sys_title);
            defaultDocumentTitles = jestMocks.nestedDocumentAncestors.map((doc) => doc.sys_title);
            rows = testFixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            textContent = rows.map((row) => row.query(By.css('.adf-datatable-cell[title="Title"]')).nativeElement.textContent.trim());

            expect(documentTitles).toEqual(defaultDocumentTitles);
            expect(textContent).toEqual(defaultDocumentTitles);
        });
    });
});
