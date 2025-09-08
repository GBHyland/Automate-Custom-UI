/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentTypeIconComponent } from './document-type-icon.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DefaultIcon } from '@alfresco/adf-hx-content-services/icons';

describe('ContentTypeIconComponent', () => {
    let component: ContentTypeIconComponent;
    let fixture: ComponentFixture<ContentTypeIconComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ContentTypeIconComponent],
        });

        fixture = TestBed.createComponent(ContentTypeIconComponent);
        component = fixture.componentInstance;
    });

    it('given an undefined Document, the mimeType should be the default file icon type', () => {
        component.document = undefined;
        component.ngOnChanges();

        expect(component.mimeType).toBe(DefaultIcon.UNKNOWN);
    });

    it('given a Folder Document, the mimeType should be the default folder icon type', () => {
        component.document = jestMocks.folderDocument;
        component.ngOnChanges();

        expect(component.mimeType).toBe(DefaultIcon.FOLDER);
    });

    it('given an expanded Folder Document, the mimeType should be the expanded folder icon type', () => {
        component.document = jestMocks.folderDocument;
        component.isExpanded = true;
        component.ngOnChanges();

        expect(component.mimeType).toBe(DefaultIcon.OPEN_FOLDER);
    });

    it('given a File Document, the mimeType should be the document mimeType', () => {
        component.document = jestMocks.fileDocument;
        component.ngOnChanges();

        expect(component.mimeType).toBe(jestMocks.fileDocument['sysfile_blob'].mimeType);
    });

    it('given a File Document without a blob, the icon should be empty', () => {
        const document: Document = { ...jestMocks.fileDocument };
        delete document['sysfile_blob'];
        component.document = document;
        component.ngOnChanges();

        expect(component.mimeType).toBe('');
    });
});
