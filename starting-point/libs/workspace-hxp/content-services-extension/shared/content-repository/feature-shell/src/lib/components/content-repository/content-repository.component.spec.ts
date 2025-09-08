/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ContentRepositoryComponent } from './content-repository.component';
import { Subject, of } from 'rxjs';
import { MockProvider, MockService } from 'ng-mocks';
import { CommonModule, registerLocaleData } from '@angular/common';
import { DataColumnComponent, DataTableComponent, NoopTranslateModule, UserPreferencesService } from '@alfresco/adf-core';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UPLOAD_MIDDLEWARE_SERVICE } from '@hxp/shared-hxp/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DebugElement, LOCALE_ID, QueryList } from '@angular/core';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import {
    DocumentService,
    ContextMenuActionsService,
    DocumentCacheService,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    DocumentActionService,
    ActionContext,
    DocumentUpdateInfo,
    provideAdfEnterpriseAdfHxContentServicesServices,
} from '@alfresco/adf-hx-content-services/services';
import { DataColumnType } from '@alfresco/adf-extensions';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    ContentPropertyViewerActionService,
    CONTEXT_MENU_ACTIONS_PROVIDERS,
    TableSkeletonLoaderComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';

// https://hyland.atlassian.net/browse/HXCS-1815
const EXPECTED_VIOLATIONS = [{ 'aria-required-children': 3 }, { 'aria-valid-attr-value': 1 }, { 'nested-interactive': 2 }];

registerLocaleData(localeEn, 'en', localeEnExtra);

const mockColumns = [
    {
        key: 'icon',
        type: 'image' as DataColumnType,
        title: 'Icon',
        sortable: false,
    },
    {
        key: 'sys_title',
        type: 'text' as DataColumnType,
        title: 'DOCUMENT_LIST.COLUMNS.TITLE',
        sortable: true,
    },
];

class MockDataColumnComponent extends DataColumnComponent {
    constructor(config: Partial<DataColumnComponent>) {
        super();
        Object.assign(this, config);
    }
}

class MockDataColumnListComponent {
    columns: QueryList<MockDataColumnComponent> = new QueryList<MockDataColumnComponent>();

    constructor(columnConfigs: Array<Partial<DataColumnComponent>>) {
        const columns = columnConfigs.map((config) => new MockDataColumnComponent(config));
        this.columns.reset(columns);
        this.columns.notifyOnChanges();
    }
}

const mockDocumentCacheService = {
    getDocument: () => of(mocks.folderDocument),
};

class MockDocumentActionService extends DocumentActionService {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    isAvailable(context: ActionContext): boolean {
        return true;
    }

    execute(context: ActionContext) {}
    /* eslint-enable @typescript-eslint/no-unused-vars */
}

describe('ContentRepositoryComponent', () => {
    let component: ContentRepositoryComponent;
    let fixture: ComponentFixture<ContentRepositoryComponent>;
    const mockContentPropertyViewerActionService: ContentPropertyViewerActionService = MockService(ContentPropertyViewerActionService);
    const mockDocumentService = MockService(DocumentService);

    const mockContentShareButtonActionService: DocumentActionService = MockService(MockDocumentActionService);

    const mockActivatedRoute = {
        url: new Subject(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, NoopAnimationsModule, NoopTranslateModule, ContentRepositoryComponent],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                ...CONTEXT_MENU_ACTIONS_PROVIDERS,
                MockProvider(ContextMenuActionsService),
                mockHxcsJsClientConfigurationService,
                MockProvider(DocumentCacheService, MockService(DocumentCacheService, mockDocumentCacheService)),
                { provide: DocumentService, useValue: mockDocumentService },
                MockProvider(UPLOAD_MIDDLEWARE_SERVICE),
                { provide: LOCALE_ID, useValue: 'en' },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                {
                    provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
                    useValue: mockContentShareButtonActionService,
                },
                MockProvider(UserPreferencesService, { select: () => of('ltr') as any }),
                { provide: FeaturesServiceToken, useValue: { isOn$: () => of(true) } },
            ],
        });

        spyOn(mockDocumentService, 'getDocumentById')
            .withArgs(ROOT_DOCUMENT.sys_id)
            .and.returnValue(of(ROOT_DOCUMENT))
            .withArgs(mocks.folderDocument.sys_id)
            .and.returnValue(of(mocks.folderDocument));
        mockDocumentService.documentCreated$ = new Subject<Document>();
        mockDocumentService.documentDeleted$ = new Subject<string>();
        mockDocumentService.documentRequestReload$ = new Subject<void>();
        mockDocumentService.clearDocumentSelection$ = new Subject<void>();
        mockDocumentService.documentUpdated$ = new Subject<DocumentUpdateInfo>();
        mockContentPropertyViewerActionService.showPropertyPanel$ = new Subject<boolean>();

        fixture = TestBed.createComponent(ContentRepositoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should clears selections when request', () => {
        spyOn((component as any).documentListElement, 'resetSelection');

        (mockDocumentService.clearDocumentSelection$ as Subject<void>).next();

        expect((component as any).documentListElement.resetSelection).toHaveBeenCalled();
    });

    it('should notifies when a document row is clicked', () => {
        spyOn(component.rowClicked, 'emit');

        const mockDocument = mocks.fileDocument;
        component.onRowClicked(mockDocument);

        expect(component.rowClicked.emit).toHaveBeenCalledWith(mockDocument);
    });

    it('should render skeleton-loader when isLoading is true', () => {
        component.isLoading = true;
        fixture.detectChanges();

        const skeletonLoader = fixture.debugElement.query(By.directive(TableSkeletonLoaderComponent));
        expect(skeletonLoader).toBeTruthy();
    });

    // flaky test failing randomly
    // eslint-disable-next-line ban/ban
    xit('should pass accessibility checks', async () => {
        component.columnList = new MockDataColumnListComponent(mockColumns);
        component.documents = mocks.nestedDocumentAncestors;
        fixture.detectChanges();
        await fixture.whenStable();

        const docRepoElement: DebugElement = fixture.debugElement;

        expect(docRepoElement).toBeTruthy();

        const res = await a11yReport('.hxp-content-repository-container');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });

    it('should clear selection on page navigate', () => {
        spyOn(component as any, 'resetTableSelection');

        mockActivatedRoute.url.next([{ path: 'new-url' }]);

        expect((component as any).resetTableSelection).toHaveBeenCalled();
    });

    it('should update updatedDocument on document update', fakeAsync(() => {
        const newDocument = mocks.nestedDocumentAncestors[0];
        const updatedProperties = new Map<string, any>([['sys_primaryType', 'someValue']]);

        component.documents = mocks.nestedDocumentAncestors;
        fixture.detectChanges();

        spyOn(mockDocumentService, 'getAncestors').and.returnValue(of([]));
        spyOn(mockDocumentService, 'updateDocument');

        (mockDocumentService.documentUpdated$ as Subject<DocumentUpdateInfo>).next({ document: newDocument, updatedProperties });

        tick();

        expect((component as any).updatedDocument).toEqual(newDocument);
    }));

    it('should not update updatedDocument when document is not in current list', fakeAsync(() => {
        const newDocument = { ...mocks.fileDocument, sys_id: 'non-existing-id' };
        const updatedProperties = new Map<string, any>([['sys_primaryType', 'someValue']]);

        component.documents = mocks.nestedDocumentAncestors;
        fixture.detectChanges();

        (mockDocumentService.documentUpdated$ as Subject<DocumentUpdateInfo>).next({ document: newDocument, updatedProperties });

        tick();

        expect((component as any).updatedDocument).toBeNull();
    }));

    it('should reselect a document when it has been updated', fakeAsync(() => {
        const selectRowOfDocumentSpy = spyOn(component as any, 'selectRowOfDocument');
        component.documents = mocks.nestedDocumentAncestors;
        fixture.detectChanges();
        const updatedDocument = mocks.nestedDocumentAncestors[0];
        const updatedProperties = new Map<string, any>([['sys_primaryType', 'someValue']]);

        expect(selectRowOfDocumentSpy).not.toHaveBeenCalled();

        (mockDocumentService.documentUpdated$ as Subject<DocumentUpdateInfo>).next({ document: updatedDocument, updatedProperties });
        component.isLoading = false;
        component.ngAfterContentChecked();
        tick();

        expect(selectRowOfDocumentSpy).toHaveBeenCalledOnceWith(updatedDocument);

        component.ngAfterContentChecked();
        tick();

        expect(selectRowOfDocumentSpy).toHaveBeenCalledOnceWith(updatedDocument);
    }));

    it('should reset sorting when the parent document changes', async () => {
        component.documents = mocks.nestedDocumentAncestors;
        component.columnList = new MockDataColumnListComponent(mockColumns);
        fixture.detectChanges();
        await fixture.whenStable();
        const datatable = fixture.debugElement.query(By.css('adf-datatable'));

        expect(datatable).toBeTruthy();

        let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

        expect(rows).toHaveSize(2);

        const datatableInstance: DataTableComponent = datatable.componentInstance;
        const documentTitles = datatableInstance.rows.map((doc: Document) => doc.sys_title);
        const defaultDocumentTitles = mocks.nestedDocumentAncestors.map((doc) => doc.sys_title);

        expect(documentTitles).toEqual(defaultDocumentTitles);
        expect(
            rows.map((row) => row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim())
        ).toEqual(defaultDocumentTitles);

        let titleHeaderCell = datatable.query(By.css('[data-automation-id="auto_header_content_id_sys_title"]'));

        expect(titleHeaderCell).toBeTruthy();

        titleHeaderCell.nativeElement.click();
        fixture.detectChanges();
        let sortingHandler = titleHeaderCell.query(By.css('.adf-datatable__header--sorted-asc'));

        expect(sortingHandler).toBeTruthy();

        mockActivatedRoute.url.next([{ path: 'new-url' }]);
        component.documents = mocks.nestedDocumentAncestors2;
        fixture.detectChanges();
        await fixture.whenStable();
        rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));

        expect(rows).toHaveSize(2);

        titleHeaderCell = datatable.query(By.css('.adf-datatable-cell-header[data-automation-id="auto_id_sys_title"]'));

        expect(titleHeaderCell).toBeTruthy();

        sortingHandler = titleHeaderCell.query(By.css('.adf-datatable__header--sorted-asc'));

        expect(sortingHandler).toBeFalsy();
    });
});
