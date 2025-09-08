/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { HxpUiBreadcrumbComponent } from './breadcrumb.component';

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

interface ComponentProperties {
    documents: Document[];
    compact: boolean;
}

describe('UI Breadcrumb', () => {
    it('should render the breadcrumb', async () => {
        const fixture = await init();
        const component = fixture.componentInstance;
        expect(component).toBeDefined();
    });

    it('should contain breadcrumb items with proper links', async () => {
        const fixture = await init({
            documents: [ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors],
        });

        const breadcrumbElement = fixture.debugElement;
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
        const fixture = await init({
            documents: [ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors],
        });

        const breadcrumbElement = fixture.debugElement;
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

        const component = fixture.componentInstance;
        component.documents = [ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors2];
        fixture.detectChanges();

        links = breadcrumbElement.queryAll(By.css('a'));
        expect(links.length).toEqual(3);

        [link1, link2, link3] = links;
        expect(link1.nativeElement.href).toContain('/documents/00000000-0000-0000-0000-000000000000');
        expect(link2.nativeElement.href).toContain('/documents/test-folder-1-id');
        expect(link3.nativeElement.href).toEqual('');
        expect(link3.nativeElement.textContent.trim()).toEqual('Test Folder 2');
    });

    it('given an unauthorized folder in the path, should display "..." without links for that folder', async () => {
        const fixture = await init({
            documents: [ROOT_DOCUMENT, undefined as any, ...jestMocks.nestedDocumentAncestors2],
        });
        const breadcrumbElement = fixture.debugElement;
        const links = breadcrumbElement.queryAll(By.css('a'));
        const otherFolders = breadcrumbElement.queryAll(By.css('.hxp-not-navigable-folder'));

        expect(links.length).toEqual(3);
        expect(otherFolders.length).toEqual(1);

        const [unauthorizedFolder] = otherFolders;

        expect(unauthorizedFolder).not.toBeNull();
        expect(unauthorizedFolder.nativeElement.textContent.trim()).toEqual('...');
    });

    it('should pass accessibility checks', async () => {
        const fixture = await init({
            documents: [ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors],
        });
        const breadcrumbElement = fixture.debugElement;

        expect(breadcrumbElement).toBeTruthy();

        const res = await a11yReport('.adf-breadcrumb');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});

async function init({ documents = [], compact = false }: Partial<ComponentProperties> = {}) {
    TestBed.configureTestingModule({
        imports: [HxpUiBreadcrumbComponent, RouterTestingModule, NoopTranslateModule],
    });

    const fixture = TestBed.createComponent(HxpUiBreadcrumbComponent);
    const component = fixture.componentInstance;
    component.documents = documents;
    component.compact = compact;

    fixture.detectChanges();

    return fixture;
}
