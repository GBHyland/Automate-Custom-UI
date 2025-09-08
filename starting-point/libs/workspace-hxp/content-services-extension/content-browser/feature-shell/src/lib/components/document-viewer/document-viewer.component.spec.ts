/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Document, ModelApi } from '@hylandsoftware/hxcs-js-client';
import { DocumentViewerComponent } from './document-viewer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { CardViewItem, NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { Observable, Subject, of } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import { a11yReport, generateMockResponse, mocks } from '@hxp/workspace-hxp/shared/testing';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonHarnessUtils, ExpansionPanelHarnessUtils, FormFieldHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import {
    DocumentService,
    DocumentUpdateInfo,
    RenditionsService,
    UserService,
    RouterExtService,
    DocumentPropertiesService,
    BlobDownloadService,
    PermissionsPanelRequestService,
    PermissionsManagementFacade,
    DocumentRouterService,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    DocumentCacheService,
    DOCUMENT_PROPERTIES_SERVICE,
    IDENTITY_USER_SERVICE_TOKEN,
    ManageVersionsButtonActionService,
    UserResolverService,
} from '@alfresco/adf-hx-content-services/services';
import { DeleteButtonActionService } from '@alfresco/adf-hx-content-services/ui';
import { provideAdfEnterpriseAdfHxContentServices } from '@alfresco/adf-hx-content-services';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { provideContentServicesExtensionContentBrowserFeatureShell } from '../../content-services-extension-content-browser-feature-shell.providers';

registerLocaleData(localeEn, 'en', localeEnExtra);

interface ExtendedCardViewItem extends CardViewItem {
    isEmpty: () => boolean;
}

// https://hyland.atlassian.net/browse/HXCS-3944
const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('DocumentViewerComponent', () => {
    let documentViewer: DocumentViewerComponent;
    let fixture: ComponentFixture<DocumentViewerComponent>;
    let downloadBlobSpy: jasmine.Spy<(documentId: string) => Observable<Blob>>;
    let listRenditionsSpy: jasmine.Spy<(documentId: string) => Observable<Document[]>>;
    let requestRenditionCreationSpy: jasmine.Spy<(documentId: string, sysrendition_id: string) => Observable<Document>>;
    let getRenditionSpy: jasmine.Spy<(documentId: string, renditionId: string) => Observable<Document>>;
    let extractCustomSchemaFieldsSpy: jasmine.Spy<() => Observable<[]>>;
    let defaultPropertiesSpy: jasmine.Spy<(document: Document) => Observable<[]>>;
    let otherPropertiesSpy: jasmine.Spy<(document: Document) => Observable<[]>>;

    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);
    const mockUserResolverService = MockService(UserResolverService);
    const mockBlobDownloadService = MockService(BlobDownloadService);
    const mockDocumentService = MockService(DocumentService);
    const mockRenditionsService = MockService(RenditionsService);
    const mockModelApi: ModelApi = MockService(ModelApi);
    const mockDocumentPropertiesService = MockService(DocumentPropertiesService);
    const mockRouterExtService = MockService(RouterExtService);
    const mockDocumentRouterService = MockService(DocumentRouterService);
    const documentLoaded$ = new Subject<Document>();
    const documentDeleted$ = new Subject<string>();
    const documentUpdated$ = new Subject<DocumentUpdateInfo>();
    const documentRestored$ = new Subject<Document>();
    const mockDefaultCardViewItems: ExtendedCardViewItem[] = [
        {
            label: '"Title"',
            value: 'Test-2023',
            key: 'sys_title',
            type: 'text',
            displayValue: 'Test-2023',
            isEmpty: () => false,
        },
        {
            label: 'Filename',
            value: 'Jun-2023.pdf',
            key: 'sysfile_blob.filename',
            type: 'text',
            displayValue: 'Filename',
            isEmpty: () => false,
        },
    ];
    const mockOtherCardViewItems: ExtendedCardViewItem[] = [
        {
            label: 'DOCUMENT.PROPERTIES.TEST.STRING',
            value: 'test string',
            key: 'test_string',
            type: 'text',
            displayValue: 'TEST_STRING',
            isEmpty: () => false,
        },
        {
            label: 'DOCUMENT.PROPERTIES.TEST.BOOLEAN',
            value: 'test boolean',
            key: 'test_boolean',
            type: 'boolean',
            displayValue: 'TEST_BOOLEAN',
            isEmpty: () => false,
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, NoopTranslateModule, DocumentViewerComponent, NoopAnimationsModule],
            providers: [
                provideAdfEnterpriseAdfHxContentServices(),
                provideContentServicesExtensionContentBrowserFeatureShell(),
                { provide: RouterExtService, useValue: mockRouterExtService },
                MockProvider(UserService),
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: mockDocumentService },
                {
                    provide: BlobDownloadService,
                    useValue: mockBlobDownloadService,
                },
                { provide: RenditionsService, useValue: mockRenditionsService },
                {
                    provide: PermissionsManagementFacade,
                    useValue: {
                        api: {
                            title$: of('Fake title'),
                            isUntouched$: of(false),
                        },
                        onInitializePermissionsManagement: () => {},
                    },
                },
                {
                    provide: DocumentRouterService,
                    useValue: mockDocumentRouterService,
                },
                DocumentCacheService,
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useClass: DeleteButtonActionService,
                },
                {
                    provide: DOCUMENT_PROPERTIES_SERVICE,
                    useValue: mockDocumentPropertiesService,
                },
                {
                    provide: ManageVersionsButtonActionService,
                    useValue: mockManageVersionsButtonActionService,
                },
                {
                    provide: UserResolverService,
                    useValue: mockUserResolverService,
                },
                {
                    provide: IDENTITY_USER_SERVICE_TOKEN,
                    useValue: {
                        getCurrentUserInfo: () => ({
                            id: '0000-fake-user-uuid-0000',
                        }),
                    },
                },
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                    'cic-versioning-new-context-menu': false,
                    'cic-workspace-satori-application-chrome': false,
                }),
            ],
        });

        mockDocumentService.documentLoaded$ = documentLoaded$.asObservable();
        mockDocumentService.documentUpdated$ = documentUpdated$.asObservable();
        mockDocumentService.documentDeleted$ = documentDeleted$.asObservable();
        mockDocumentService.documentRestored$ = documentRestored$.asObservable();
        mockManageVersionsButtonActionService.showVersionsPanel$ = new Subject<boolean>();

        ngMocks.autoSpy('jasmine');
        downloadBlobSpy = spyOn(mockBlobDownloadService, 'downloadBlob')
            .withArgs(mocks.fileDocument.sys_id)
            .and.callFake(() => of(new Blob()))
            .withArgs(mocks.versionSupportedDocument.sys_id)
            .and.callFake(() => of(new Blob()));

        listRenditionsSpy = spyOn(mockRenditionsService, 'listRenditions').withArgs(mocks.fileDocument.sys_id).and.returnValue(of([]));

        requestRenditionCreationSpy = spyOn(mockRenditionsService, 'requestRenditionCreation')
            .withArgs(mocks.fileDocument.sys_id, 'pdfPreview')
            .and.returnValue(of(mocks.renditionPending));

        getRenditionSpy = spyOn(mockRenditionsService, 'getRendition')
            .withArgs(mocks.fileDocument.sys_id, 'pdfPreview')
            .and.returnValue(of(mocks.renditionCompleted));

        spyOn(mockDocumentService, 'getAncestors')
            .withArgs(mocks.fileDocument.sys_id)
            .and.callFake(() => of([ROOT_DOCUMENT, mocks.fileDocument]))
            .withArgs(mocks.versionSupportedDocument.sys_id)
            .and.callFake(() => of([ROOT_DOCUMENT, mocks.versionSupportedDocument]));

        spyOn(mockDocumentService, 'getDocumentById').and.returnValue(of(ROOT_DOCUMENT));

        spyOn(mockModelApi, 'getModel').and.returnValue(generateMockResponse({ data: mocks.modelApi }));

        extractCustomSchemaFieldsSpy = spyOn(mockDocumentPropertiesService, 'extractCustomSchemaFields').and.returnValue(of());

        defaultPropertiesSpy = spyOn(mockDocumentPropertiesService, 'getDefaultPropertiesFromDocument').and.returnValue(of(mockDefaultCardViewItems));

        otherPropertiesSpy = spyOn(mockDocumentPropertiesService, 'getPropertiesFromDocument').and.returnValue(of(mockOtherCardViewItems));

        fixture = TestBed.createComponent(DocumentViewerComponent);
        documentViewer = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        extractCustomSchemaFieldsSpy.calls.reset();
        downloadBlobSpy.calls.reset();
        defaultPropertiesSpy.calls.reset();
        otherPropertiesSpy.calls.reset();
        listRenditionsSpy.calls.reset();
        requestRenditionCreationSpy.calls.reset();
        getRenditionSpy.calls.reset();
        fixture.destroy();
    });

    it("should not fetch blob if document doesn't have one", () => {
        expect(documentViewer).toBeTruthy();
        expect(downloadBlobSpy).not.toHaveBeenCalled();

        const fileWithoutBlob = {
            ...mocks.fileDocument,
            sysfile_blob: undefined,
        };

        documentViewer.document = fileWithoutBlob;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        const viewer = fixture.debugElement.query(By.css('adf-viewer'));
        expect(viewer).toBeTruthy();

        expect(downloadBlobSpy).not.toHaveBeenCalled();
    });

    it('should fetch document main blob to preview', () => {
        expect(documentViewer).toBeTruthy();
        expect(downloadBlobSpy).not.toHaveBeenCalled();

        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(downloadBlobSpy).toHaveBeenCalled();
    });

    it('should display the document breadcrumb', async () => {
        expect(documentViewer).toBeTruthy();

        documentViewer.document = mocks.fileDocument;
        documentLoaded$.next(mocks.fileDocument);
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        const documentBreadcrumb = fixture.debugElement.query(By.css('hxp-breadcrumb'));
        expect(documentBreadcrumb).toBeTruthy();
    });

    it('should display document actions', async () => {
        expect(documentViewer).toBeTruthy();

        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        const customActions = fixture.debugElement.query(By.css('#document-viewer-custom-actions'));
        expect(customActions).toBeTruthy();
        expect(customActions.children).toHaveSize(5); // 5 actions: download, share, delete, manage versions, properties

        await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: {
                selector: '#document-viewer-fullscreen',
            },
        });
    });

    it('should navigate to parent on back', async () => {
        expect(documentViewer).toBeTruthy();

        const redirectToRefererSpy = spyOn(mockRouterExtService, 'redirectToReferer').and.callThrough();
        spyOn(documentViewer, 'onClose').and.callThrough();

        const urlForParentSpy = spyOn(mockDocumentRouterService, 'urlForParent').and.returnValue('parent_document_url');

        documentViewer.document = mocks.fileDocument;
        (documentViewer as any).refererURL = 'your_referer_url';
        fixture.detectChanges();

        expect(redirectToRefererSpy).not.toHaveBeenCalled();
        expect(urlForParentSpy).not.toHaveBeenCalled();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '#document-viewer-close-button',
            },
        });

        expect(urlForParentSpy).toHaveBeenCalledOnceWith(mocks.fileDocument);
        expect(redirectToRefererSpy).toHaveBeenCalledOnceWith((documentViewer as any).refererURL, 'parent_document_url');
    });

    it('should redirect to search result page when viewer opened from search result', async () => {
        expect(documentViewer).toBeTruthy();
        documentViewer.document = mocks.fileDocument;
        (documentViewer as any).refererURL = '/search?query=test';
        fixture.detectChanges();

        const redirectToRefererSpy = spyOn(mockRouterExtService, 'redirectToReferer').and.callThrough();
        const urlForParentSpy = spyOn(mockDocumentRouterService, 'urlForParent').and.returnValue('parent_document_url');

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '#document-viewer-close-button',
            },
        });

        expect(urlForParentSpy).toHaveBeenCalledOnceWith(mocks.fileDocument);
        expect(redirectToRefererSpy).toHaveBeenCalledOnceWith('/search?query=test', 'parent_document_url');
    });

    it('should show and hide manage version panel when requested', async () => {
        documentViewer.document = mocks.versionSupportedDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(documentViewer.rightSidebarPanelType).toEqual('properties');

        (mockManageVersionsButtonActionService.showVersionsPanel$ as Subject<boolean>).next(true);
        fixture.detectChanges();
        await fixture.whenStable();
        let manageVersionsSidebar = fixture.debugElement.query(By.css('hxp-manage-versions-sidebar'));

        expect(documentViewer.rightSidebarVisibility).toBeTrue();
        expect(documentViewer.actionContext.showPanel).toEqual('version');
        expect(documentViewer.rightSidebarPanelType).toEqual('versions');
        expect(manageVersionsSidebar).toBeTruthy();

        documentViewer.closeRightSidebarPanel('versions');
        fixture.detectChanges();
        manageVersionsSidebar = fixture.debugElement.query(By.css('hxp-manage-versions-sidebar'));

        expect(documentViewer.rightSidebarVisibility).toBeFalse();
        expect(documentViewer.actionContext.showPanel).toBeUndefined();
        expect(manageVersionsSidebar).toBeFalsy();
    });

    it('should show and hide Permissions Management Panel when requested', async () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();
        const permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);

        expect(documentViewer.rightSidebarPanelType).toEqual('properties');

        permissionsPanelRequestService.requestOpenPanel();
        fixture.detectChanges();
        await fixture.whenStable();
        let permissionsManagementPanel = fixture.debugElement.query(By.css('hxp-permissions-management-panel'));

        expect(documentViewer.rightSidebarPanelType).toEqual('permissions');
        expect(permissionsManagementPanel).toBeTruthy();

        permissionsPanelRequestService.requestClosePanel();
        fixture.detectChanges();
        permissionsManagementPanel = fixture.debugElement.query(By.css('hxp-permissions-management-panel'));

        expect(permissionsManagementPanel).toBeFalsy();
    });

    it('should open the side panel to display document properties', async () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(documentViewer).toBeTruthy();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '#document-properties-viewer-button',
            },
        });

        const propertiesViewerContainer = fixture.debugElement.query(By.css('#properties-viewer-container'));
        expect(propertiesViewerContainer).toBeTruthy();
    });

    it('should set editablePropertiesSidebar to true if document has READ_WRITE permission', () => {
        documentViewer.document = { ...mocks.fileDocument, sys_effectivePermissions: ['ReadWrite'] };
        documentViewer.ngOnChanges();
        expect((documentViewer as any).editablePropertiesSidebar).toBeTrue();
    });

    it('should set editablePropertiesSidebar to false if document does not have READ_WRITE permission', () => {
        documentViewer.document = { ...mocks.fileDocument, sys_effectivePermissions: ['Read'] };
        documentViewer.ngOnChanges();
        expect((documentViewer as any).editablePropertiesSidebar).toBeFalse();
    });

    it('should update actionContext when document changes', () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        expect(documentViewer.actionContext.documents).toEqual([mocks.fileDocument]);
        expect(documentViewer.actionContext.shouldRedirect).toBeTrue();
        expect(documentViewer.actionContext.refererURL).toBeUndefined(); // refererURL is not set in this mock document, it should be undefined
    });

    it('should set rightSidebarPanelType and rightSidebarVisibility when setRightSidebarPanel is called', () => {
        (documentViewer as any).setRightSidebarPanel(true, 'versions');
        expect(documentViewer.rightSidebarPanelType).toBe('versions');
        expect(documentViewer.rightSidebarVisibility).toBeTrue();

        (documentViewer as any).setRightSidebarPanel(false, 'versions');
        expect(documentViewer.rightSidebarVisibility).toBeFalse();
    });

    it('should call contentPropertyViewerActionService.execute and manageVersionsButtonActionService.execute in setRightSidebarActionContext', () => {
        const contentPropertyViewerActionService = (documentViewer as any).contentPropertyViewerActionService;
        const manageVersionsButtonActionService = (documentViewer as any).manageVersionsButtonActionService;
        const contentSpy = spyOn(contentPropertyViewerActionService, 'execute');
        const versionSpy = spyOn(manageVersionsButtonActionService, 'execute');
        (documentViewer as any).setRightSidebarActionContext(true, 'properties');
        expect(contentSpy).toHaveBeenCalled();
        expect(versionSpy).toHaveBeenCalled();
    });

    it('should display document properties sidebar on clicking document-properties-viewer-info-button', async () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '[data-automation-id="document-properties-viewer-button"]',
            },
        });

        const propertiesViewerContainers = fixture.debugElement.queryAll(By.css('hxp-properties-viewer-container'));

        expect(propertiesViewerContainers.length).toBe(2);

        const [defaultContainer, otherContainer] = propertiesViewerContainers;

        const defaultPanel = await ExpansionPanelHarnessUtils.getExpansionPanel({
            fixture,
            expansionPanelFilters: {
                title: 'DOCUMENT.PROPERTIES.VIEWER.MAIN.CONTAINER.HEADER',
            },
        });

        const otherPanel = await ExpansionPanelHarnessUtils.getExpansionPanel({
            fixture,
            expansionPanelFilters: {
                title: 'DOCUMENT.PROPERTIES.VIEWER.OTHER.CONTAINER.HEADER',
            },
        });

        expect(await defaultPanel.isExpanded()).toBeTrue();
        expect(await otherPanel.isExpanded()).toBeFalse();

        const defaultProperties = defaultContainer.queryAll(By.css('.adf-property'));
        const otherProperties = otherContainer.queryAll(By.css('.adf-property'));

        expect(defaultProperties.length).toEqual(2);

        expect(otherProperties.length).toEqual(2);
    });

    it('should contain correct properties displayed in correct hxp-properties-viewer-container', async () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '[data-automation-id="document-properties-viewer-button"]',
            },
        });

        const fields = await FormFieldHarnessUtils.getAllFormFields({
            fixture,
        });

        expect(await fields[0].getLabel()).toContain('Title');
        expect(await fields[1].getLabel()).toContain('Filename');
        expect(await fields[2].getLabel()).toContain('DOCUMENT.PROPERTIES.TEST.STRING');
        expect(await fields[3].getLabel()).toContain('DOCUMENT.PROPERTIES.TEST.BOOLEAN');
    });

    it('should not call rendition if mimeType is natively supported', () => {
        documentViewer.document = mocks.viewerSupportedDocument;
        expect(downloadBlobSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        expect(downloadBlobSpy).toHaveBeenCalled();
    });

    it('should call rendition if mimeType is not natively supported', fakeAsync(() => {
        documentViewer.document = mocks.viewerNotSupportedDocument;
        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();
        expect(requestRenditionCreationSpy).toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();
    }));

    it('should not request rendition if already exists', fakeAsync(() => {
        documentViewer.document = mocks.viewerNotSupportedDocument;
        listRenditionsSpy.withArgs(mocks.viewerNotSupportedDocument.sys_id).and.returnValue(of([mocks.renditionCompleted]));

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();

        tick();

        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();
    }));

    it('should poll for rendition while pending', fakeAsync(() => {
        documentViewer.document = mocks.viewerNotSupportedDocument;
        listRenditionsSpy.withArgs(mocks.viewerNotSupportedDocument.sys_id).and.returnValue(of([mocks.renditionPending]));
        getRenditionSpy.withArgs(mocks.viewerNotSupportedDocument.sys_id, 'pdfPreview').and.returnValue(of(mocks.renditionPending));

        expect(listRenditionsSpy).not.toHaveBeenCalled();
        expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
        expect(getRenditionSpy).not.toHaveBeenCalled();

        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(listRenditionsSpy).toHaveBeenCalled();

        tick();

        expect(getRenditionSpy).toHaveBeenCalled();

        tick(2000);

        expect(getRenditionSpy).toHaveBeenCalledTimes(3); // Check if component is polling for rendition

        discardPeriodicTasks();
    }));

    it('should remember the right sidebar visibility when a Document is updated', async () => {
        documentViewer.document = mocks.fileDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        expect(documentViewer.rightSidebarVisibility).toBeFalse();

        let updatedProperties = new Map<string, any>([['sys_primaryType', 'SysFolder']]);
        documentUpdated$.next({ document: { ...mocks.fileDocument, sys_primaryType: 'SysFolder' }, updatedProperties });
        fixture.detectChanges();
        await fixture.whenStable();

        expect(documentViewer.document.sys_primaryType).toBe('SysFolder');
        expect(documentViewer.rightSidebarVisibility).toBeFalse();

        fixture.detectChanges();
        await fixture.whenStable();
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '#document-properties-viewer-button',
            },
        });

        expect(documentViewer.rightSidebarVisibility).toBeTrue();
        expect(documentViewer.actionContext.showPanel).toEqual('property');
        expect(documentViewer.rightSidebarPanelType).toEqual('properties');

        updatedProperties = new Map<string, any>([['sys_primaryType', 'SysFile']]);
        documentUpdated$.next({ document: { ...mocks.fileDocument, sys_primaryType: 'SysFile' }, updatedProperties });
        fixture.detectChanges();
        await fixture.whenStable();

        expect(documentViewer.document.sys_primaryType).toBe('SysFile');
        expect(documentViewer.rightSidebarVisibility).toBeTrue();
        expect(documentViewer.actionContext.showPanel).toEqual('property');
        expect(documentViewer.rightSidebarPanelType).toEqual('properties');
    });

    it('should pass accessibility checks', async () => {
        documentViewer.document = mocks.viewerSupportedDocument;
        documentViewer.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('#hxp-viewer');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });

    it('should update properties when document sys_id matches', () => {
        const updatedDoc = mocks.fileDocument;
        documentViewer.document = updatedDoc;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        documentUpdated$.next({
            document: updatedDoc,
            updatedProperties: undefined,
        });

        expect(documentViewer.document).toEqual(updatedDoc);
        expect(documentViewer['editablePropertiesSidebar']).toBeTrue();
        expect(documentViewer.actionContext.documents).toEqual([updatedDoc]);
    });

    it('should not update properties when document sys_id does not match', () => {
        const initialDoc = mocks.fileDocument;
        documentViewer.document = initialDoc;
        documentViewer.ngOnChanges();
        fixture.detectChanges();

        const initialSidebarState = documentViewer['editablePropertiesSidebar'];
        const initialActionContext = { ...documentViewer.actionContext };
        const updatedDoc = {
            sys_id: '456',
            sys_primaryType: 'SysFile',
        } as Document;

        documentUpdated$.next({
            document: updatedDoc,
            updatedProperties: undefined,
        });

        expect(documentViewer.document).toEqual(initialDoc);
        expect(documentViewer['editablePropertiesSidebar']).toBe(initialSidebarState);
        expect(documentViewer.actionContext).toEqual(initialActionContext);
    });
});
