/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HxpBreadcrumbComponent } from './breadcrumb.component';
import { MockProvider, ngMocks } from 'ng-mocks';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Subject, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { jestMocks, a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

interface ComponentProperties {
    document: Document;
    compact: boolean;
}

describe('HXP Breadcrumb', () => {
    let getAncestorsSpy: jest.SpyInstance<any>;

    async function init({ document, compact = false }: Partial<ComponentProperties> = {}) {
        TestBed.configureTestingModule({
            imports: [HxpBreadcrumbComponent, RouterTestingModule, NoopTranslateModule],
            providers: [
                MockProvider(DocumentService, {
                    getAncestors: jest.fn().mockImplementation((sys_id) => {
                        switch (sys_id) {
                            case jestMocks.nestedDocument.sys_id: {
                                return of([ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors]);
                            }
                            case jestMocks.folderDocument.sys_id: {
                                return of([ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors2]);
                            }
                            case jestMocks.nestedDocumentAncestors2[1].sys_id: {
                                return of([ROOT_DOCUMENT, undefined as any, ...jestMocks.nestedDocumentAncestors2]);
                            }
                            default: {
                                return of([]);
                            }
                        }
                    }),
                    documentLoaded$: new Subject<any>(),
                    documentUpdated$: new Subject<any>(),
                }),
            ],
        });

        const documentService = TestBed.inject(DocumentService);
        getAncestorsSpy = jest.spyOn(documentService, 'getAncestors');

        const fixture = TestBed.createComponent(HxpBreadcrumbComponent);
        const component = fixture.componentInstance;
        component.compact = compact;
        component.document = document as Document;

        fixture.detectChanges();

        return fixture;
    }

    beforeAll(() => {
        ngMocks.autoSpy('jest');
    });

    it('should render the breadcrumb', async () => {
        const fixture = await init();
        const component = fixture.componentInstance;
        expect(component).toBeDefined();
    });

    it('should contain breadcrumb items with proper links', async () => {
        const fixture = await init({ document: jestMocks.nestedDocument });

        const breadcrumbElement: DebugElement = fixture.debugElement;
        const links = breadcrumbElement.queryAll(By.css('a'));
        expect(links.length).toEqual(3);

        const [link1, link2, link3] = links;
        expect(link1).not.toBeNull();
        expect(link2).not.toBeNull();
        expect(link3).not.toBeNull();
        expect(link1.nativeElement.href).toContain('/documents/00000000-0000-0000-0000-000000000000');
        expect(link2.nativeElement.href).toContain('/documents/e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84');
        expect(link3.nativeElement.href).toEqual('');
    });

    it('should react on document changes', async () => {
        const fixture = await init({ document: jestMocks.nestedDocument });

        const breadcrumbElement: DebugElement = fixture.debugElement;
        let links = breadcrumbElement.queryAll(By.css('a'));
        expect(links.length).toEqual(3);

        let [link1, link2, link3] = links;
        expect(link1).not.toBeNull();
        expect(link2).not.toBeNull();
        expect(link3).not.toBeNull();
        expect(link1.nativeElement.href).toContain('/documents/00000000-0000-0000-0000-000000000000');
        expect(link2.nativeElement.href).toContain('/documents/e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84');
        expect(link3.nativeElement.href).toEqual('');
        expect(link3.nativeElement.textContent.trim()).toEqual('Nested Folder 1');

        expect(getAncestorsSpy).toHaveBeenCalledTimes(1);
        expect(getAncestorsSpy).toHaveBeenCalledWith(jestMocks.nestedDocument.sys_id);

        const component = fixture.componentInstance;
        component.document = jestMocks.folderDocument;
        component.ngOnChanges({
            document: {
                previousValue: undefined,
                currentValue: document,
                firstChange: false,
                isFirstChange: () => true,
            },
        });
        fixture.detectChanges();

        expect(getAncestorsSpy).toHaveBeenCalledTimes(2);
        expect(getAncestorsSpy).toHaveBeenCalledWith(jestMocks.folderDocument.sys_id);

        links = breadcrumbElement.queryAll(By.css('a'));
        expect(links.length).toEqual(3);

        [link1, link2, link3] = links;
        expect(link1.nativeElement.href).toContain('/documents/00000000-0000-0000-0000-000000000000');
        expect(link2.nativeElement.href).toContain('/documents/test-folder-1-id');
        expect(link3.nativeElement.href).toEqual('');
        expect(link3.nativeElement.textContent.trim()).toEqual('Test Folder 2');
    });

    it('given an unauthorized folder in the path, should display "..." without links for that folder', async () => {
        const fixture = await init({ document: jestMocks.nestedDocumentAncestors2[1] });
        const breadcrumbElement: DebugElement = fixture.debugElement;
        const links = breadcrumbElement.queryAll(By.css('a'));
        const otherFolders = breadcrumbElement.queryAll(By.css('.hxp-not-navigable-folder'));

        expect(links.length).toEqual(3);
        expect(otherFolders.length).toEqual(1);

        const [unauthorizedFolder] = otherFolders;

        expect(unauthorizedFolder).not.toBeNull();
        expect(unauthorizedFolder.nativeElement.textContent.trim()).toEqual('...');
    });

    it('should pass accessibility checks', async () => {
        const fixture = await init({ document: jestMocks.nestedDocument });
        const breadcrumbElement: DebugElement = fixture.debugElement;

        expect(breadcrumbElement).toBeTruthy();
        const res = await a11yReport('.adf-breadcrumb');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
