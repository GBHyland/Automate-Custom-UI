/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderBreadcrumbComponent } from './folder-breadcrumb.component';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { IconHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { BreadcrumbData, BreadcrumbDataService, BreadcrumbEntryTypes } from '../../services/breadcrumb-data.service';

describe('FolderBreadcrumbComponent', () => {
    let component: FolderBreadcrumbComponent;
    let fixture: ComponentFixture<FolderBreadcrumbComponent>;
    let breadcrumbDataServiceSpyObj: any;

    beforeEach(() => {
        breadcrumbDataServiceSpyObj = jasmine.createSpyObj('BreadcrumbDataService', ['setIsFromFolder']);
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, FolderBreadcrumbComponent],
            providers: [
                {
                    provide: BreadcrumbDataService,
                    useValue: breadcrumbDataServiceSpyObj,
                },
            ],
        });

        fixture = TestBed.createComponent(FolderBreadcrumbComponent);
        component = fixture.componentInstance;
    });

    it('should display current folder name', () => {
        const breadcrumbData: BreadcrumbData = {
            parentFolder: ROOT_DOCUMENT,
            currentFolder: mocks.folderDocument,
            subFolders: [],
            totalCount: 0,
        };
        component.breadcrumbData = breadcrumbData;
        fixture.detectChanges();
        const currentFolderElement = fixture.nativeElement.querySelector('.hxp-current-folder span');
        expect(currentFolderElement.innerText).toBe(mocks.folderDocument.sys_name);
    });

    it('when back is clicked, should emit the parent Document', async () => {
        spyOn(component.selectedFolder, 'emit');
        const breadcrumbData: BreadcrumbData = {
            parentFolder: ROOT_DOCUMENT,
            currentFolder: mocks.folderDocument,
            subFolders: [...mocks.nestedDocumentAncestors, ...mocks.nestedDocumentAncestors2],
            totalCount: 4,
        };

        component.breadcrumbData = breadcrumbData;

        const backFolderElement = await IconHarnessUtils.getIcon({ fixture });
        await (await backFolderElement.host()).click();

        expect(component.selectedFolder.emit).toHaveBeenCalledWith({
            document: ROOT_DOCUMENT,
            type: BreadcrumbEntryTypes.PARENT,
        });
    });

    it('should display all sub folders', () => {
        const breadcrumbData: BreadcrumbData = {
            parentFolder: ROOT_DOCUMENT,
            currentFolder: ROOT_DOCUMENT,
            subFolders: [...mocks.nestedDocumentAncestors, ...mocks.nestedDocumentAncestors2],
            totalCount: 4,
        };
        component.breadcrumbData = breadcrumbData;
        fixture.detectChanges();
        const currentFolderElements = fixture.nativeElement.querySelectorAll('hxp-folder-icon');

        expect(currentFolderElements.length).toBe(4);
    });

    it('when a subfolder is clicked should emit the sub folder Document', () => {
        spyOn(component.selectedFolder, 'emit');
        const breadcrumbData: BreadcrumbData = {
            parentFolder: ROOT_DOCUMENT,
            currentFolder: ROOT_DOCUMENT,
            subFolders: [...mocks.nestedDocumentAncestors, ...mocks.nestedDocumentAncestors2],
            totalCount: 4,
        };
        component.breadcrumbData = breadcrumbData;
        fixture.detectChanges();
        const subFolderElements = fixture.nativeElement.querySelectorAll('.hxp-sub-folder');
        subFolderElements[0].click();
        fixture.detectChanges();
        expect(component.selectedFolder.emit).toHaveBeenCalledWith({
            document: mocks.nestedDocumentAncestors[0],
            type: BreadcrumbEntryTypes.SELF,
        });
    });

    it('when Document sys_id is present, then should return sys_id as rowId', () => {
        const rowId = component.getFolderId(0, mocks.fileDocument);

        expect(rowId).toEqual(mocks.fileDocument.sys_id);
    });

    it('when Document sys_id is not present, then a row id based on parent folder sys_id should be returned', () => {
        const documentWithoutSysId = {
            ...mocks.fileDocument,
            sys_id: undefined,
        };
        const rowId = component.getFolderId(0, documentWithoutSysId);
        const expectedRowId = documentWithoutSysId.sys_parentId + '_subfolder_' + documentWithoutSysId.sys_name;
        expect(rowId).toEqual(expectedRowId);
    });
});
