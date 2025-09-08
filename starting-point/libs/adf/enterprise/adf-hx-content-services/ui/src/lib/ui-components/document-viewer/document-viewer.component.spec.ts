/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule, ViewerComponent } from '@alfresco/adf-core';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    BlobDownloadService,
    DocumentCacheService,
    DocumentService,
    DocumentUpdateInfo,
    RenditionsService,
    UserService,
} from '@alfresco/adf-hx-content-services/services';
import { Component, SimpleChange, ViewChild } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { a11yReport, generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document, ModelApi } from '@hylandsoftware/hxcs-js-client';
import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { Observable, of, Subject } from 'rxjs';
import { HxpUiDocumentViewerComponent } from './document-viewer.component';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

// https://hyland.atlassian.net/browse/HXCS-3944
const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

@Component({
    standalone: false,
    selector: 'hxp-test-component',
    template: `
        <hxp-ui-document-viewer #documentViewer [document]="document">
            <ng-template #toolbar>
                <div id="test-toolbar">Toolbar</div>
            </ng-template>
            <ng-template #sidebar>
                <div id="test-sidebar">Sidebar</div>
            </ng-template>
        </hxp-ui-document-viewer>
    `,
})
class TestComponent {
    document: Document = jestMocks.viewerSupportedDocument;

    @ViewChild('documentViewer')
    documentViewer!: HxpUiDocumentViewerComponent;
}

const generateSimpleChanges = (component: HxpUiDocumentViewerComponent) => {
    return { document: new SimpleChange([], component.document, false) };
};

describe('Hxp UI DocumentViewerComponent', () => {
    let documentViewer: HxpUiDocumentViewerComponent;
    let fixture: ComponentFixture<HxpUiDocumentViewerComponent>;
    let downloadBlobSpy: jest.SpyInstance<Observable<Blob>>;
    let listRenditionsSpy: jest.SpyInstance<Observable<Document[]>>;
    let requestRenditionCreationSpy: jest.SpyInstance<Observable<Document>>;
    let getRenditionSpy: jest.SpyInstance<Observable<Document>>;

    const mockBlobDownloadService = MockService(BlobDownloadService);
    const mockDocumentService = MockService(DocumentService);
    const mockRenditionsService = MockService(RenditionsService);
    const mockModelApi: ModelApi = MockService(ModelApi);
    const documentLoaded$ = new Subject<Document>();
    const documentUpdated$ = new Subject<DocumentUpdateInfo>();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HxpUiDocumentViewerComponent, RouterTestingModule, NoopAnimationsModule, NoopTranslateModule, MatDialogModule],
            providers: [
                MockProvider(UserService),
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: mockDocumentService },
                { provide: BlobDownloadService, useValue: mockBlobDownloadService },
                { provide: RenditionsService, useValue: mockRenditionsService },
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                }),
                DocumentCacheService,
            ],
            declarations: [TestComponent],
        });

        mockDocumentService.documentLoaded$ = documentLoaded$.asObservable();
        mockDocumentService.documentUpdated$ = documentUpdated$.asObservable();

        ngMocks.autoSpy('jest');
        downloadBlobSpy = jest.spyOn(mockBlobDownloadService, 'downloadBlob').mockReturnValue(of(new Blob()));

        listRenditionsSpy = jest.spyOn(mockRenditionsService, 'listRenditions').mockReturnValue(of([]));

        requestRenditionCreationSpy = jest.spyOn(mockRenditionsService, 'requestRenditionCreation').mockReturnValue(of(jestMocks.renditionPending));

        getRenditionSpy = jest.spyOn(mockRenditionsService, 'getRendition').mockReturnValue(of(jestMocks.renditionCompleted));

        jest.spyOn(mockDocumentService, 'getAncestors').mockReturnValue(of([ROOT_DOCUMENT, jestMocks.fileDocument]));

        jest.spyOn(mockDocumentService, 'getDocumentById').mockReturnValue(of(ROOT_DOCUMENT));

        jest.spyOn(mockModelApi, 'getModel').mockReturnValue(generateMockResponse({ data: jestMocks.modelApi }));
        window.scrollTo = jest.fn();

        fixture = TestBed.createComponent(HxpUiDocumentViewerComponent);
        documentViewer = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        downloadBlobSpy.mockReset();
        listRenditionsSpy.mockReset();
        requestRenditionCreationSpy.mockReset();
        getRenditionSpy.mockReset();
        fixture.destroy();
    });

    it("should not fetch blob if document doesn't have one", () => {
        expect(documentViewer).toBeTruthy();
        expect(downloadBlobSpy).not.toHaveBeenCalled();

        const fileWithoutBlob = {
            ...jestMocks.fileDocument,
            sysfile_blob: undefined,
        };
        documentViewer.document = fileWithoutBlob;
        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();
        const viewer = fixture.debugElement.query(By.css('adf-viewer'));

        expect(viewer).toBeTruthy();
        expect(downloadBlobSpy).not.toHaveBeenCalled();
    });

    it('should fetch document main blob to preview', () => {
        expect(downloadBlobSpy).not.toHaveBeenCalled();

        documentViewer.document = jestMocks.fileDocument;
        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();

        expect(downloadBlobSpy).toHaveBeenCalled();
    });

    it('should emit an event when closing the viewer', () => {
        const closeViewerSpy = jest.spyOn(documentViewer.closeViewer, 'emit');

        expect(closeViewerSpy).not.toHaveBeenCalled();

        documentViewer.document = jestMocks.fileDocument;
        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();
        const adfViewer = fixture.debugElement.query(By.directive(ViewerComponent));
        adfViewer.componentInstance.showViewerChange.emit(false);

        expect(closeViewerSpy).toHaveBeenCalledTimes(1);
    });

    it('should render the sidebar when provided', () => {
        const testFixture = TestBed.createComponent(TestComponent);
        testFixture.detectChanges();
        let sidebar = testFixture.debugElement.query(By.css('adf-viewer-sidebar'));

        expect(sidebar).toBeFalsy();

        (testFixture.componentInstance.documentViewer as any).viewer.showRightSidebar = true;
        testFixture.detectChanges();

        sidebar = testFixture.debugElement.query(By.css('adf-viewer-sidebar'));
        const testSidebar = testFixture.debugElement.query(By.css('#test-sidebar'));

        expect(sidebar).toBeTruthy();
        expect(testSidebar).toBeTruthy();
    });

    it('should render the topbar when provided', () => {
        const testFixture = TestBed.createComponent(TestComponent);
        testFixture.detectChanges();
        const toolbar = testFixture.debugElement.query(By.css('adf-viewer-toolbar'));
        const testToolbar = testFixture.debugElement.query(By.css('#test-toolbar'));

        expect(toolbar).toBeTruthy();
        expect(testToolbar).toBeTruthy();
    });

    it('should not call rendition if mimeType is natively supported', () => {
        documentViewer.document = jestMocks.viewerSupportedDocument;

        expect(downloadBlobSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();
        expect(downloadBlobSpy).toHaveBeenCalled();
    });

    it('should call rendition if mimeType is not natively supported', fakeAsync(() => {
        documentViewer.document = jestMocks.viewerNotSupportedDocument;

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();
        expect(requestRenditionCreationSpy).toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();
    }));

    it('should not request rendition if already exists', fakeAsync(() => {
        documentViewer.document = jestMocks.viewerNotSupportedDocument;
        listRenditionsSpy.mockReturnValue(of([jestMocks.renditionCompleted]));

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();

        tick();

        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();
    }));

    it('should poll for rendition while pending', fakeAsync(() => {
        documentViewer.document = jestMocks.viewerNotSupportedDocument;
        listRenditionsSpy.mockReturnValue(of([jestMocks.renditionPending]));
        getRenditionSpy.mockReturnValue(of(jestMocks.renditionPending));

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();

        tick(2000);

        expect(getRenditionSpy).toHaveBeenCalledTimes(3); // Check if component is polling for rendition

        discardPeriodicTasks();
    }));

    it('should pass accessibility checks', async () => {
        documentViewer.document = jestMocks.viewerSupportedDocument;
        documentViewer.ngOnChanges(generateSimpleChanges(documentViewer));
        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('#hxp-viewer');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
