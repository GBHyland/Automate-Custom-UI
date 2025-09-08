/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HxpDocumentTreeComponent } from './hxp-document-tree.component';
import { Observable, Subject, firstValueFrom, lastValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
    DocumentFetchResults,
    DocumentService,
    ContextMenuActionsService,
    DocumentActionService,
    ActionContext,
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    BlobDownloadService,
    DocumentTreeDatabaseService,
    ManageVersionsButtonActionService,
} from '@alfresco/adf-hx-content-services/services';
import { jestMocks, a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { CheckboxHarnessUtils, TreeHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { take } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, SimpleChange, ViewChild } from '@angular/core';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

const EXPECTED_VIOLATIONS: any = [
    {
        'aria-allowed-attr': 3,
    },
];

const REFRESH_DEBOUNCE = 1000;

const mockDocumentService: DocumentService = MockService(DocumentService);

const mockDeleteDocumentSpy = (spy: jest.SpyInstance<Observable<string>>) => {
    return spy.mockImplementation((documentId) => {
        (mockDocumentService.documentDeleted$ as Subject<string>).next(documentId);
        return of(documentId);
    });
};

const mockCreateDocumentSpy = (spy: jest.SpyInstance<Observable<Document>>, document: Document) => {
    return spy.mockImplementation(() => {
        (mockDocumentService.documentCreated$ as Subject<Document>).next(document);
        return of(document);
    });
};

class MockDocumentActionService extends DocumentActionService {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    isAvailable(context: ActionContext): boolean {
        return true;
    }

    execute(context: ActionContext) {}
    /* eslint-enable @typescript-eslint/no-unused-vars */
}

const generateSimpleChanges = (component: HxpDocumentTreeComponent) => {
    return { documents: new SimpleChange([], component.documents, false) };
};

const getAllCheckboxes = (params: { fixture: ComponentFixture<HxpDocumentTreeComponent>; checked: boolean }): Promise<MatCheckboxHarness[]> => {
    return CheckboxHarnessUtils.getAllCheckboxes({
        fixture: params.fixture,
        checkboxFilters: {
            checked: params.checked,
            selector: '.hxp-node-selection-checkbox',
        },
        fromRoot: true,
    });
};

@Component({
    selector: 'hxp-test-component',
    template: `
        <hxp-document-tree #documentTree>
            <ng-template #contextActionMenu>
                <div>context menu mock</div>
            </ng-template>
        </hxp-document-tree>
    `,
    imports: [CommonModule, HxpDocumentTreeComponent],
    standalone: true,
})
class TestComponent {
    @ViewChild('documentTree')
    documentTree!: HxpDocumentTreeComponent;
}

describe('HXP UI Document Tree', () => {
    let getFolderChildrenSpy: jest.SpyInstance<Observable<DocumentFetchResults>>;
    let getAncestorsSpy: jest.SpyInstance<Observable<Document[]>>;
    let notifyDocumentLoadedSpy: jest.SpyInstance<void, [document: Document], any>;
    let createDocumentSpy: jest.SpyInstance<Observable<Document>>;
    let deletedDocumentSpy: jest.SpyInstance<Observable<string>>;

    const mockDocumentCopyActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockDocumentMoveActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockContentShareButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockDeleteButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockPermissionsButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockSingleItemDownloadButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockSingleItemInfoButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);
    const mockBlobDownloadService = MockService(BlobDownloadService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HxpDocumentTreeComponent, RouterTestingModule, NoopAnimationsModule, NoopTranslateModule, TestComponent],
            providers: [
                { provide: HXP_DOCUMENT_COPY_ACTION_SERVICE, useValue: mockDocumentCopyActionService },
                { provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE, useValue: mockDocumentMoveActionService },
                { provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE, useValue: mockDeleteButtonActionService },
                { provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE, useValue: mockContentShareButtonActionService },
                { provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE, useValue: mockPermissionsButtonActionService },
                { provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE, useValue: mockSingleItemDownloadButtonActionService },
                { provide: HXP_DOCUMENT_INFO_ACTION_SERVICE, useValue: mockSingleItemInfoButtonActionService },
                { provide: ManageVersionsButtonActionService, useValue: mockManageVersionsButtonActionService },
                MockProvider(DocumentService, mockDocumentService),
                MockProvider(ContextMenuActionsService),
                DocumentTreeDatabaseService,
                { provide: BlobDownloadService, useValue: mockBlobDownloadService },
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                }),
            ],
        });
        mockDocumentService.documentDeleted$ = new Subject();
        mockDocumentService.documentCreated$ = new Subject();
        mockDocumentService.documentLoaded$ = new Subject();
        mockDocumentService.documentUpdated$ = new Subject();
        mockDocumentService.documentMoved$ = new Subject();
        mockDocumentService.documentCopied$ = new Subject();

        ngMocks.autoSpy('jest');
        getFolderChildrenSpy = jest.spyOn(mockDocumentService, 'getFolderChildren').mockReturnValue(
            of({
                documents: [...jestMocks.nestedDocumentAncestors],
                limit: 10,
                offset: 0,
                totalCount: 2,
            })
        );

        getAncestorsSpy = jest.spyOn(mockDocumentService, 'getAncestors').mockImplementation((documentId: string) => {
            switch (documentId) {
                case jestMocks.folderDocument.sys_id: {
                    return of([ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors]);
                }
                case jestMocks.fileDocument.sys_id: {
                    return of([ROOT_DOCUMENT]);
                }
                case jestMocks.nestedDocument.sys_id: {
                    return of([ROOT_DOCUMENT, jestMocks.folderDocument]);
                }
                default: {
                    return of([]);
                }
            }
        });

        notifyDocumentLoadedSpy = jest
            .spyOn(mockDocumentService, 'notifyDocumentLoaded')
            .mockImplementation((doc: Document) => (mockDocumentService.documentLoaded$ as Subject<Document>).next(doc));

        deletedDocumentSpy = jest.spyOn(mockDocumentService, 'deleteDocument');
        mockDeleteDocumentSpy(deletedDocumentSpy);
        mockDeleteDocumentSpy(deletedDocumentSpy);

        createDocumentSpy = jest.spyOn(mockDocumentService, 'createDocument');
        mockCreateDocumentSpy(createDocumentSpy, jestMocks.nestedDocumentAncestors2[0]);
        mockCreateDocumentSpy(createDocumentSpy, jestMocks.fileDocument);

        Element.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
        getFolderChildrenSpy.mockReset();
        getAncestorsSpy.mockReset();
        notifyDocumentLoadedSpy.mockReset();
        createDocumentSpy.mockReset();
        deletedDocumentSpy.mockReset();
    });

    describe('Common behaviors', () => {
        let component: HxpDocumentTreeComponent;
        let fixture: ComponentFixture<HxpDocumentTreeComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(HxpDocumentTreeComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should render the document tree with children', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);

            const [root, node1, node2] = nodes;
            expect(root).not.toBeNull();
            expect(node1).not.toBeNull();
            expect(node2).not.toBeNull();

            expect(await root.getText()).toEqual('DOCUMENT_TREE.ROOT');
            expect(await node1.getText()).toEqual('Folder 1');
            expect(await node2.getText()).toEqual('Nested Folder 1');
        });

        it('should render children documents upon node expansion', async () => {
            let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);

            const [root, node1, node2] = nodes;
            expect(root).not.toBeNull();
            expect(node1).not.toBeNull();
            expect(node2).not.toBeNull();

            await node1.expand();

            nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes.length).toBe(5);
        });

        it('should select the document on node click', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);

            const [root, node1, node2] = nodes;
            expect(root).not.toBeNull();
            expect(node1).not.toBeNull();
            expect(node2).not.toBeNull();

            expect(await (await node1.host()).hasClass('hxp-selected')).toBe(false);

            const selectedDocument = firstValueFrom(component.selectedDocument);

            const nodeContainers = fixture.debugElement.queryAll(By.css('.hxp-node-container'));
            nodeContainers[1].nativeElement.click();
            fixture.detectChanges();

            expect(await (await node1.host()).hasClass('hxp-selected')).toBe(true);
            expect(await selectedDocument).toEqual(jestMocks.nestedDocumentAncestors[0]);
        });

        it('should not select already selected document on node click', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);

            const [root, node1, node2] = nodes;
            /**
             We're taking 2 emissions from the selectedDocument observable, but selecting documents
             3 times. This is because the second time we select the same document, the observable is supposed
             to omit the same value again, firing only on the third event with the different document.
            */
            const selectedDocument = lastValueFrom(component.selectedDocument.pipe(take(2)));

            expect(root).not.toBeNull();
            expect(node1).not.toBeNull();
            expect(node2).not.toBeNull();

            const nodeContainers = fixture.debugElement.queryAll(By.css('.hxp-node-container'));

            nodeContainers[1].nativeElement.click();
            fixture.detectChanges();

            nodeContainers[1].nativeElement.click();
            fixture.detectChanges();

            nodeContainers[2].nativeElement.click();
            fixture.detectChanges();

            expect(await selectedDocument).toEqual(jestMocks.nestedDocumentAncestors[1]);
        });

        it('should not change the tree when a non-folderish document is deleted', fakeAsync(async () => {
            let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);

            expect(deletedDocumentSpy).toHaveBeenCalledTimes(0);
            expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

            mockDocumentService.deleteDocument(jestMocks.fileDocument.sys_id);
            tick(REFRESH_DEBOUNCE);
            fixture.detectChanges();

            expect(deletedDocumentSpy).toHaveBeenCalledTimes(1);
            expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

            nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            expect(nodes).toHaveLength(3);
        }));

        it('should set the document when one is provided as input', async () => {
            let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            let node1 = nodes[1];

            expect(node1).not.toBeNull();
            expect(await (await node1.host()).hasClass('hxp-selected')).toBe(false);

            component.documents = [jestMocks.folderDocument];
            component.ngOnChanges(generateSimpleChanges(component));
            fixture.detectChanges();

            nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            node1 = nodes[1];

            expect(await (await node1.host()).hasClass('hxp-selected')).toBe(true);
        });

        it('should allow multiple document selection', async () => {
            const selectedDocuments: Document[] = [];
            const selectedDocumentSpy = jest.spyOn(component.selectedDocument, 'emit');
            component.selectedDocument.subscribe((value) => selectedDocuments.push(value));

            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            let checkboxes = await getAllCheckboxes({ fixture, checked: false });

            expect(checkboxes).toHaveLength(0);

            component.multiSelection = true;
            fixture.detectChanges();

            checkboxes = await getAllCheckboxes({ fixture, checked: false });

            expect(checkboxes).toHaveLength(2);
            expect(selectedDocumentSpy).not.toHaveBeenCalled();

            for (const checkbox of checkboxes) {
                await checkbox.toggle();
            }
            checkboxes = await getAllCheckboxes({ fixture, checked: true });

            expect(checkboxes).toHaveLength(2);
            expect(selectedDocumentSpy).toHaveBeenCalledTimes(2);
            expect(selectedDocuments).toEqual(jestMocks.nestedDocumentAncestors);
        });

        it('should set the document provided as input when multiple selection is enabled', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            component.multiSelection = true;
            component.documents = [jestMocks.folderDocument];
            component.ngOnChanges(generateSimpleChanges(component));
            fixture.detectChanges();

            let checkboxes = await getAllCheckboxes({ fixture, checked: true });

            expect(checkboxes).toHaveLength(1);

            checkboxes = await getAllCheckboxes({ fixture, checked: false });

            expect(checkboxes).toHaveLength(1);
        });

        it('should set multiple documents provided as input', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            component.multiSelection = true;
            component.documents = [...jestMocks.nestedDocumentAncestors];
            component.ngOnChanges(generateSimpleChanges(component));
            fixture.detectChanges();

            let checkboxes = await getAllCheckboxes({ fixture, checked: true });

            expect(checkboxes).toHaveLength(2);

            checkboxes = await getAllCheckboxes({ fixture, checked: false });

            expect(checkboxes).toHaveLength(0);
        });

        it("shouldn't select any node in the tree if the input document is unknown", async () => {
            let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            nodes.forEach(async (node) => {
                expect(node).not.toBeNull();
                expect(await (await node.host()).hasClass('hxp-selected')).toBe(false);
            });

            component.documents = [jestMocks.fileDocument];
            fixture.detectChanges();

            nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            nodes.forEach(async (node) => {
                expect(node).not.toBeNull();
                expect(await (await node.host()).hasClass('hxp-selected')).toBe(false);
            });
        });

        it('should pass accessibility checks', async () => {
            const res = await a11yReport('.hxp-fill');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });
    });

    describe('without context menu', () => {
        let fixture: ComponentFixture<HxpDocumentTreeComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(HxpDocumentTreeComponent);
            fixture.detectChanges();
        });

        it('should not display the context menu button when a context menu template is not provided', async () => {
            const contextMenuActionsService = TestBed.inject(ContextMenuActionsService);
            const openContextMenuSpy = contextMenuActionsService.getContextActions;
            await TreeHarnessUtils.getTreeNodes({ fixture });
            jest.spyOn(mockSingleItemDownloadButtonActionService, 'isAvailable').mockReturnValue(true);
            jest.spyOn(mockDeleteButtonActionService, 'isAvailable').mockReturnValue(true);
            fixture.detectChanges();

            expect(openContextMenuSpy).not.toHaveBeenCalled();

            const buttonElements = fixture.debugElement.queryAll(By.css('.hxp-context-btn button'));

            expect(buttonElements).toHaveLength(0);
        });
    });

    describe('with context menu', () => {
        let component: HxpDocumentTreeComponent;
        let fixture: ComponentFixture<TestComponent>;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            component = fixture.componentInstance.documentTree;
        });

        it('should open context menu on node context click', async () => {
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

            expect(nodes).toHaveLength(3);

            const onContextMenuSpy = jest.spyOn(component as any, 'onContextMenu');
            const [root, node1, node2] = nodes;

            expect(onContextMenuSpy).not.toHaveBeenCalled();
            expect(root).not.toBeNull();
            expect(node1).not.toBeNull();
            expect(node2).not.toBeNull();

            const mockEvent: MouseEvent = new MouseEvent('contextmenu');
            const nodeContainers = fixture.debugElement.queryAll(By.css('.hxp-node-container'));
            nodeContainers[1].nativeElement.dispatchEvent(mockEvent);
            fixture.detectChanges();

            expect(onContextMenuSpy).toHaveBeenCalled();
        });

        it('should update context action referenced document', async () => {
            const openContextMenuSpy = jest.spyOn(component as any, 'openContextMenu');
            await TreeHarnessUtils.getTreeNodes({ fixture });
            jest.spyOn(component as any, 'hasVisibleActions').mockReturnValue(true);
            jest.spyOn(mockSingleItemDownloadButtonActionService, 'isAvailable').mockReturnValue(true);
            jest.spyOn(mockDeleteButtonActionService, 'isAvailable').mockReturnValue(true);
            fixture.detectChanges();

            expect(openContextMenuSpy).not.toHaveBeenCalled();

            const buttonElements = fixture.debugElement.queryAll(By.css('.hxp-context-btn button'));
            buttonElements[0].nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(openContextMenuSpy.mock.calls).toEqual([[new MouseEvent('click'), ROOT_DOCUMENT]]);
            expect((component as any).contextActions[0].data.sys_id).toBe(ROOT_DOCUMENT.sys_id);

            buttonElements[1].nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(openContextMenuSpy).toHaveBeenCalledWith(new MouseEvent('click'), jestMocks.nestedDocumentAncestors[0]);
            expect((component as any).contextActions[0].data.sys_id).toBe(jestMocks.nestedDocumentAncestors[0].sys_id);
        });

        it('should scroll the tree node into view when treeNode is clicked', async () => {
            const spyScrollTreeNodeIntoView = jest.spyOn(component as any, 'scrollTreeNodeIntoView');
            const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
            await nodes[1].toggle();

            expect(spyScrollTreeNodeIntoView).toHaveBeenCalled();
        });
    });
});
