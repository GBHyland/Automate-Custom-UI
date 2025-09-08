/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ContentBrowserComponent } from './hxp-content-browser.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ContentPropertyViewerActionService, DeleteButtonActionService, HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import { NoopTranslateModule, UserPreferencesService } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { IsFolderishDocumentPipe } from './is-folderish-document.pipe';
import { a11yReport, generateMockError, mocks } from '@hxp/workspace-hxp/shared/testing';
import { provideContentServicesExtensionContentBrowserFeatureShell } from '../../content-services-extension-content-browser-feature-shell.providers';
import { UPLOAD_MIDDLEWARE_SERVICE } from '@hxp/shared-hxp/services';
import { NotFeaturesDirective, provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { PaginatorHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import {
    DocumentService,
    DocumentCreateProperties,
    DocumentFetchOptions,
    DocumentFetchResults,
    isFile,
    isFolder,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    DocumentPermissions,
    DocumentRouterService,
    DocumentCacheService,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    ContextMenuActionsService,
    HxpNotificationService,
    UserResolverPipe,
    provideAdfEnterpriseAdfHxContentServicesServices,
    ManageVersionsButtonActionService,
    DocumentUpdateInfo,
} from '@alfresco/adf-hx-content-services/services';
import { ROOT_DOCUMENT, documentApiProvider, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';

registerLocaleData(localeEn, 'en', localeEnExtra);

// https://hyland.atlassian.net/browse/HXCS-3943
const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [
    { 'aria-required-children': 3 },
    { 'nested-interactive': 2 },
];

describe('ContentBrowserComponent', () => {
    const REFRESH_DEBOUNCE = 1000;
    const mockDocumentService: DocumentService = MockService(DocumentService);
    const documentRouterService: DocumentRouterService = MockService(DocumentRouterService);
    const mockContentPropertyViewerActionService: ContentPropertyViewerActionService = MockService(ContentPropertyViewerActionService);

    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);

    const documentUpdated$ = new Subject<DocumentUpdateInfo>();
    const documentRestored$ = new Subject<Document>();

    const mockDeleteDocumentSpy = (spy: jasmine.Spy<(documentId: string) => Observable<string>>, document: Document) => {
        return spy.withArgs(document.sys_id).and.callFake((documentId) => {
            (mockDocumentService.documentDeleted$ as Subject<string>).next(documentId);
            return of(documentId);
        });
    };

    const mockCreateDocumentSpy = (spy: jasmine.Spy<(properties: DocumentCreateProperties) => Observable<Document>>, document: Document) => {
        return spy.withArgs({ sys_primaryType: document.sys_primaryType }).and.callFake(() => {
            (mockDocumentService.documentCreated$ as Subject<Document>).next(document);
            return of(document);
        });
    };

    const configureTestingModule = async (providers: any[]) => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RouterTestingModule,
                NoopTranslateModule,
                DocumentViewerComponent,
                IsFolderishDocumentPipe,
                ContentBrowserComponent,
            ],
            providers: [
                provideContentServicesExtensionContentBrowserFeatureShell(),
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                MockProvider(ContextMenuActionsService),
                { provide: DocumentService, useValue: mockDocumentService },
                MockProvider(UPLOAD_MIDDLEWARE_SERVICE),
                MockProvider(UserPreferencesService, {
                    select: () => of('en-En') as any,
                }),
                {
                    provide: DocumentRouterService,
                    useValue: documentRouterService,
                },
                {
                    provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
                    useValue: mockContentPropertyViewerActionService,
                },
                {
                    provide: ManageVersionsButtonActionService,
                    useValue: mockManageVersionsButtonActionService,
                },
                NotFeaturesDirective,
                DocumentCacheService,
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useClass: DeleteButtonActionService,
                },
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                    'cic-workspace-satori-application-chrome': false,
                }),
                ...providers,
            ],
        }).compileComponents();

        spyOn(mockDocumentService, 'getAncestors')
            .withArgs(ROOT_DOCUMENT.sys_id)
            .and.returnValue(of([ROOT_DOCUMENT]))
            .withArgs(mocks.fileDocument.sys_id)
            .and.returnValue(of([ROOT_DOCUMENT, mocks.fileDocument]))
            .withArgs(mocks.folderDocument.sys_id)
            .and.returnValue(of([ROOT_DOCUMENT, mocks.folderDocument]));

        mockDocumentService.documentDeleted$ = new Subject();
        mockDocumentService.documentCreated$ = new Subject();
        mockDocumentService.documentLoaded$ = new Subject();
        mockDocumentService.documentUpdated$ = documentUpdated$.asObservable();
        mockDocumentService.documentRestored$ = documentRestored$.asObservable();
        mockDocumentService.documentRequestReload$ = new Subject();
        mockDocumentService.clearDocumentSelection$ = new Subject<void>();
        mockContentPropertyViewerActionService.showPropertyPanel$ = new Subject<boolean>();
        mockManageVersionsButtonActionService.showVersionsPanel$ = new Subject<boolean>();
    };

    describe('as authorized user', () => {
        let contentBrowser: ContentBrowserComponent;
        let fixture: ComponentFixture<ContentBrowserComponent>;

        let getAllChildrenSpy: jasmine.Spy<(documentId: string, options: DocumentFetchOptions) => Observable<DocumentFetchResults>>;
        let createDocumentSpy: jasmine.Spy<(properties: DocumentCreateProperties) => Observable<Document>>;
        let deletedDocumentSpy: jasmine.Spy<(documentId: string) => Observable<string>>;

        beforeEach(async () => {
            await configureTestingModule([[UserResolverPipe]]);

            ngMocks.autoSpy('jasmine');
            getAllChildrenSpy = spyOn(mockDocumentService, 'getAllChildren')
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: [...mocks.nestedDocumentAncestors].reverse(),
                        limit: 25,
                        offset: 0,
                        totalCount: 2,
                    })
                )
                .withArgs(mocks.nestedDocument.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: [...mocks.nestedDocumentAncestors2].reverse(),
                        limit: 25,
                        offset: 0,
                        totalCount: 2,
                    })
                )
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: ['sys_title asc'],
                })
                .and.returnValue(
                    of({
                        documents: [...mocks.nestedDocumentAncestors],
                        limit: 25,
                        offset: 0,
                        totalCount: 2,
                    })
                )
                .withArgs(mocks.folderDocument.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: [],
                        limit: 25,
                        offset: 0,
                        totalCount: 0,
                    })
                );

            spyOn(mockDocumentService, 'getDocumentById').and.returnValue(of(ROOT_DOCUMENT));

            deletedDocumentSpy = spyOn(mockDocumentService, 'deleteDocument');
            mockDeleteDocumentSpy(deletedDocumentSpy, mocks.nestedDocumentAncestors[1]);
            createDocumentSpy = spyOn(mockDocumentService, 'createDocument');
            mockCreateDocumentSpy(createDocumentSpy, mocks.fileDocument);

            fixture = TestBed.createComponent(ContentBrowserComponent);
            contentBrowser = fixture.componentInstance;
            fixture.detectChanges();
        });

        afterEach(() => {
            getAllChildrenSpy.calls.reset();
            createDocumentSpy.calls.reset();
            deletedDocumentSpy.calls.reset();
            fixture.destroy();
        });

        it('should refresh on document creation', fakeAsync(() => {
            expect(contentBrowser).toBeTruthy();

            (contentBrowser as any).document = ROOT_DOCUMENT;
            contentBrowser.fetchChildren();
            fixture.detectChanges();

            let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(2);

            expect(createDocumentSpy).not.toHaveBeenCalled();

            getAllChildrenSpy.calls.reset();

            mockDocumentService.getAllChildren = getAllChildrenSpy
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: [...mocks.nestedDocumentAncestors, mocks.fileDocument],
                        limit: 25,
                        offset: 0,
                        totalCount: 3,
                    })
                );

            mockDocumentService.createDocument({ sys_primaryType: 'SysFile' });
            tick(REFRESH_DEBOUNCE);
            fixture.detectChanges();

            expect(getAllChildrenSpy).toHaveBeenCalledTimes(1);
            expect(createDocumentSpy).toHaveBeenCalled();

            rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(3);
        }));

        it('should refresh on document delete', fakeAsync(() => {
            expect(contentBrowser).toBeTruthy();

            (contentBrowser as any).document = ROOT_DOCUMENT;
            contentBrowser.fetchChildren();
            fixture.detectChanges();

            let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(2);

            expect(deletedDocumentSpy).not.toHaveBeenCalled();

            getAllChildrenSpy.calls.reset();

            mockDocumentService.getAllChildren = getAllChildrenSpy
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: [mocks.nestedDocumentAncestors[0]],
                        limit: 25,
                        offset: 0,
                        totalCount: 1,
                    })
                );

            mockDocumentService.deleteDocument(mocks.nestedDocumentAncestors[1].sys_id);
            tick(REFRESH_DEBOUNCE);
            fixture.detectChanges();

            expect(getAllChildrenSpy).toHaveBeenCalledTimes(1);
            expect(deletedDocumentSpy).toHaveBeenCalled();

            rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(1);
        }));

        it('should clear item selection when `clearDocumentSelection` emitted', () => {
            expect(contentBrowser).toBeTruthy();
            (contentBrowser as any).document = ROOT_DOCUMENT;
            fixture.detectChanges();

            // Create a spy for the clearSelection method of the HxpDocumentListComponent
            const documentListDebugElement = fixture.debugElement.query(By.directive(HxpDocumentListComponent));
            const documentListComponent = documentListDebugElement.componentInstance;
            spyOn(documentListComponent, 'resetSelection');

            const clearDocumentSelection$ = mockDocumentService.clearDocumentSelection$ as Subject<void>;
            clearDocumentSelection$.next();

            fixture.detectChanges();

            expect(documentListComponent.resetSelection).toHaveBeenCalled();
        });

        it('should navigate to document on row click', () => {
            expect(contentBrowser).toBeTruthy();

            const navigateToSpy = spyOn(documentRouterService, 'navigateTo');

            (contentBrowser as any).document = ROOT_DOCUMENT;
            fixture.detectChanges();

            expect(documentRouterService.navigateTo).not.toHaveBeenCalled();

            const documentList = fixture.debugElement.query(By.css('hxp-document-list'));
            expect(documentList).toBeTruthy();

            documentList.componentInstance.rowClicked.emit(mocks.nestedDocumentAncestors[0]);
            fixture.detectChanges();

            expect(navigateToSpy).toHaveBeenCalledOnceWith(mocks.nestedDocumentAncestors[0]);
        });

        it('should display document previewer if document is filish', () => {
            expect(contentBrowser).toBeTruthy();
            expect(isFile(mocks.fileDocument)).toBeTruthy();

            (contentBrowser as any).document = mocks.fileDocument;
            fixture.detectChanges();

            const documentList = fixture.debugElement.query(By.css('hxp-document-list'));
            expect(documentList).toBeFalsy();

            const documentViewer = fixture.debugElement.query(By.css('hxp-document-viewer'));
            expect(documentViewer).toBeTruthy();
        });

        it('should not display document previewer if document is folderish', () => {
            expect(contentBrowser).toBeTruthy();
            expect(isFolder(ROOT_DOCUMENT)).toBeTruthy();

            (contentBrowser as any).document = ROOT_DOCUMENT;
            fixture.detectChanges();

            const documentList = fixture.debugElement.query(By.css('hxp-document-list'));
            expect(documentList).toBeTruthy();

            const documentViewer = fixture.debugElement.query(By.css('hxp-document-viewer'));
            expect(documentViewer).toBeFalsy();
        });

        it('should allow upload for document creation if document has `CreateChild` permission', () => {
            expect(contentBrowser).toBeTruthy();

            const document: Document = {
                ...mocks.folderDocument,
                sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
            };
            (contentBrowser as any).document = document;
            contentBrowser.ngOnChanges();
            fixture.detectChanges();

            const documentList = fixture.debugElement.query(By.css('hxp-document-list'));
            expect(documentList).toBeTruthy();

            const uploadDragArea = fixture.debugElement.query(By.css('hxp-content-upload-drag-area'));
            expect(uploadDragArea).toBeTruthy();
            expect(uploadDragArea.componentInstance.disabled).toBeUndefined();
        });

        it("should not allow upload for document creation if document doesn't have CreateChild permission", () => {
            expect(contentBrowser).toBeTruthy();

            (contentBrowser as any).document = {
                ...mocks.folderDocument,
                sys_effectivePermissions: [],
            };
            contentBrowser.ngOnChanges();
            fixture.detectChanges();

            const documentList = fixture.debugElement.query(By.css('hxp-document-list'));

            expect(documentList).toBeTruthy();

            const uploadDragArea = fixture.debugElement.query(By.css('hxp-content-upload-drag-area'));

            expect(uploadDragArea).toBeTruthy();
            expect(uploadDragArea.componentInstance.disabled).toBeTruthy();
        });

        it('should show right property panel when truthy value is emitted', fakeAsync(() => {
            expect(contentBrowser.actionContext.showPanel).toBeUndefined();

            (mockContentPropertyViewerActionService.showPropertyPanel$ as Subject<boolean>).next(true);

            tick();

            expect(contentBrowser.actionContext.showPanel).toEqual('property');
        }));

        it('should set editable value depending the document permissions', () => {
            (contentBrowser as any).document = ROOT_DOCUMENT;
            contentBrowser.fetchChildren();
            fixture.detectChanges();

            expect((contentBrowser as any).selection).toHaveSize(0);

            let contentRepositoryComponent = fixture.debugElement.query(By.css('hxp-content-repository'));
            contentRepositoryComponent.triggerEventHandler('selectionChanged', [
                { ...mocks.nestedDocumentAncestors[0], sys_effectivePermissions: ['Read'] },
            ]);
            fixture.detectChanges();

            expect((contentBrowser as any).selection).toHaveSize(1);
            expect((contentBrowser as any).editablePropertiesSidebar).toBeFalse();

            contentRepositoryComponent = fixture.debugElement.query(By.css('hxp-content-repository'));
            contentRepositoryComponent.triggerEventHandler('selectionChanged', [
                { ...mocks.nestedDocumentAncestors[0], sys_effectivePermissions: ['ReadWrite'] },
            ]);
            fixture.detectChanges();

            expect((contentBrowser as any).selection).toHaveSize(1);
            expect((contentBrowser as any).editablePropertiesSidebar).toBeTrue();
        });

        it('should show manage version panel when truthy value is emitted', fakeAsync(() => {
            expect(contentBrowser.actionContext.showPanel).toBeUndefined();

            (mockManageVersionsButtonActionService.showVersionsPanel$ as Subject<boolean>).next(true);

            tick();

            expect(contentBrowser.actionContext.showPanel).toEqual('version');
        }));

        it('should update document list on paginator events', async () => {
            expect(contentBrowser).toBeTruthy();

            getAllChildrenSpy.calls.reset();

            mockDocumentService.getAllChildren = getAllChildrenSpy
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 0,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: Array.from({ length: 25 }).fill(mocks.nestedDocumentAncestors[0]),
                        limit: 25,
                        offset: 0,
                        totalCount: 30,
                    } as DocumentFetchResults)
                );

            (contentBrowser as any).document = ROOT_DOCUMENT;
            contentBrowser.fetchChildren();
            fixture.detectChanges();

            const paginator = await PaginatorHarnessUtils.getPaginator({
                fixture,
            });
            expect(await paginator.getRangeLabel()).toEqual('1 – 25 of 30');

            const datatable = fixture.debugElement.query(By.css('adf-datatable'));
            expect(datatable).toBeTruthy();

            let rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(25);
            for (const row of rows) {
                expect(row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim()).toEqual(
                    mocks.nestedDocumentAncestors[0].sys_title
                );
            }

            getAllChildrenSpy.calls.reset();

            mockDocumentService.getAllChildren = getAllChildrenSpy
                .withArgs(ROOT_DOCUMENT.sys_id, {
                    limit: 25,
                    offset: 25,
                    sort: [],
                })
                .and.returnValue(
                    of({
                        documents: Array.from({ length: 5 }).fill(mocks.nestedDocumentAncestors[1]),
                        limit: 25,
                        offset: 25,
                        totalCount: 30,
                    } as DocumentFetchResults)
                );

            await paginator.goToNextPage();
            expect(await paginator.getRangeLabel()).toEqual('26 – 30 of 30');

            rows = fixture.debugElement.queryAll(By.css('.adf-datatable-body adf-datatable-row'));
            expect(rows).toBeTruthy();
            expect(rows).toHaveSize(5);
            for (const row of rows) {
                expect(row.query(By.css('.adf-datatable-cell[title="DOCUMENT_LIST.COLUMNS.TITLE"]')).nativeElement.textContent.trim()).toEqual(
                    mocks.nestedDocumentAncestors[1].sys_title
                );
            }
        });

        it('should reset pagination offset when the content changes', async () => {
            expect(contentBrowser).toBeTruthy();

            (contentBrowser as any).document = ROOT_DOCUMENT;
            (contentBrowser as any).paginatorConfig.offset = 10;
            fixture.detectChanges();

            expect((contentBrowser as any).paginatorConfig.offset).toBe(10);

            (contentBrowser as any).document = mocks.folderDocument;
            contentBrowser.ngOnChanges();
            fixture.detectChanges();

            expect((contentBrowser as any).paginatorConfig.offset).toBe(0);
        });

        it('should close the right property panel upon triggering the close function', () => {
            spyOn(mockContentPropertyViewerActionService, 'execute');
            contentBrowser.actionContext.showPanel = 'property';
            contentBrowser.handleCloseSidebarPanel();

            expect(contentBrowser.actionContext.showPanel).toBeUndefined();
            expect(mockContentPropertyViewerActionService.execute).toHaveBeenCalledWith(contentBrowser.actionContext);
        });

        it('should close the manage version panel upon triggering the close function', () => {
            spyOn(mockManageVersionsButtonActionService, 'execute');
            contentBrowser.actionContext.showPanel = 'version';
            contentBrowser.handleCloseSidebarPanel();

            expect(contentBrowser.actionContext.showPanel).toBeUndefined();
            expect(mockManageVersionsButtonActionService.execute).toHaveBeenCalledWith(contentBrowser.actionContext);
        });

        it('should refresh document list when a child document is updated', fakeAsync(() => {
            (contentBrowser as any).document = ROOT_DOCUMENT;
            fixture.detectChanges();

            getAllChildrenSpy.calls.reset();

            const updatedChildDocument = {
                sys_id: 'child-id',
                sys_primaryType: 'SysFile',
                sys_parentId: ROOT_DOCUMENT.sys_id,
            };
            documentUpdated$.next({
                document: updatedChildDocument,
                updatedProperties: undefined,
            });

            tick();
            expect(getAllChildrenSpy).toHaveBeenCalled();
        }));

        it('should not refresh document list when an unrelated document is updated', fakeAsync(() => {
            (contentBrowser as any).document = ROOT_DOCUMENT;
            fixture.detectChanges();

            getAllChildrenSpy.calls.reset();

            const unrelatedDocument = {
                sys_id: 'unrelated-id',
                sys_primaryType: 'SysFile',
                sys_parentId: 'different-parent-id',
            };
            documentUpdated$.next({
                document: unrelatedDocument,
                updatedProperties: undefined,
            });

            tick();
            expect(getAllChildrenSpy).not.toHaveBeenCalled();
        }));

        // flaky test failing randomly
        // eslint-disable-next-line ban/ban
        xit('should pass accessibility checks', waitForAsync(async () => {
            (contentBrowser as any).document = {
                ...mocks.folderDocument,
                sys_effectivePermissions: [],
            };
            contentBrowser.ngOnChanges();
            fixture.detectChanges();
            await fixture.whenStable();

            const res = await a11yReport('.hxp-main-content-wrapper');
            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        }));
    });

    describe('as unauthorized user', () => {
        let fixture: ComponentFixture<ContentBrowserComponent>;
        let routeParamEmitter: Subject<any>;

        let getDocumentByIdSpy: jasmine.Spy<(documentId: string) => Observable<Document>>;

        beforeEach(async () => {
            routeParamEmitter = new Subject();
            await configureTestingModule([
                documentApiProvider,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: routeParamEmitter.asObservable(),
                        url: of([{ path: null }]),
                    },
                },
            ]);

            getDocumentByIdSpy = spyOn(mockDocumentService, 'getDocumentById').and.returnValue(throwError(generateMockError('Forbidden', 403)));
            spyOn(mockDocumentService, 'getAllChildren').and.returnValue(throwError(generateMockError('Forbidden', 403)));

            fixture = TestBed.createComponent(ContentBrowserComponent);
            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should display an error message when an unauthorized user try to access a forbidden folder', fakeAsync(() => {
            const hxpNotificationService: HxpNotificationService = TestBed.inject(HxpNotificationService);
            const hxpNotificationServiceSpy = spyOn(hxpNotificationService, 'showError');

            expect(hxpNotificationServiceSpy).not.toHaveBeenCalled();

            routeParamEmitter.next({ id: 'unauthorized-folder-id' });
            fixture.detectChanges();
            tick(REFRESH_DEBOUNCE);

            expect(hxpNotificationServiceSpy).toHaveBeenCalledTimes(1);
            expect(hxpNotificationServiceSpy).toHaveBeenCalledWith('CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.403');
        }));

        it('should display an error message when an unauthenticated user try to access the workspace app', fakeAsync(() => {
            getDocumentByIdSpy.and.callFake(() => throwError(generateMockError('Unauthenticated user', 401)));
            const hxpNotificationService: HxpNotificationService = TestBed.inject(HxpNotificationService);
            const hxpNotificationServiceSpy = spyOn(hxpNotificationService, 'showError');

            expect(hxpNotificationServiceSpy).not.toHaveBeenCalled();

            routeParamEmitter.next({ id: ROOT_DOCUMENT.sys_id });
            fixture.detectChanges();
            tick(REFRESH_DEBOUNCE);

            expect(hxpNotificationServiceSpy).toHaveBeenCalledTimes(1);
            expect(hxpNotificationServiceSpy).toHaveBeenCalledWith('CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.401');
        }));

        it('should display the root folder despite user have no permissions to access', fakeAsync(() => {
            const hxpNotificationService: HxpNotificationService = TestBed.inject(HxpNotificationService);
            const hxpNotificationServiceSpy = spyOn(hxpNotificationService, 'showError');

            expect(hxpNotificationServiceSpy).not.toHaveBeenCalled();

            routeParamEmitter.next({});
            fixture.detectChanges();
            tick(REFRESH_DEBOUNCE);

            expect(hxpNotificationServiceSpy).not.toHaveBeenCalled();
        }));
    });
});
