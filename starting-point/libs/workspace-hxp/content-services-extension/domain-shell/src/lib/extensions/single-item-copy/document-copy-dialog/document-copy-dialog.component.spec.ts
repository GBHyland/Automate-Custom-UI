/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentCopyDialogComponent, CopyDialogData } from './document-copy-dialog.component';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DocumentService, HxpNotificationService, CopyStatus, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopTranslateModule } from '@alfresco/adf-core';
import {
    copyApiProvider,
    queryApiProvider,
    documentApiProvider,
    ROOT_DOCUMENT,
    mockHxcsJsClientConfigurationService,
} from '@alfresco/adf-hx-content-services/api';
import { BreadcrumbDataService, BreadcrumbEntryTypes } from '../../../services/breadcrumb-data.service';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('DocumentCopyDialogComponent', () => {
    let component: DocumentCopyDialogComponent;
    let fixture: ComponentFixture<DocumentCopyDialogComponent>;
    let hxpNotificationService: HxpNotificationService;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DocumentCopyDialogComponent>>;
    let documentServiceSpyObj: any;
    let breadcrumbDataServiceSpyObj: any;
    let notificationServiceSpy: any;
    const dialogData: CopyDialogData = {
        parentDocument: ROOT_DOCUMENT,
        documentToCopy: mocks.fileDocument,
    };
    const breadcrumbData = {
        currentFolder: mocks.fileDocument,
        subFolders: mocks.nestedDocumentAncestors,
        totalCount: 2,
    };

    beforeEach(() => {
        breadcrumbDataServiceSpyObj = jasmine.createSpyObj('BreadcrumbDataService', ['getBreadcrumbData', 'filterSubfolders', 'resetPagination']);
        documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['requestReload', 'copyDocument', 'updateDocument']);
        const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        dialogRefSpyObj.afterClosed.and.returnValue(of());

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, NoopAnimationsModule, NoopTranslateModule, DocumentCopyDialogComponent],
            providers: [
                mockHxcsJsClientConfigurationService,
                copyApiProvider,
                documentApiProvider,
                queryApiProvider,
                { provide: DocumentService, useValue: documentServiceSpyObj },
                FormBuilder,
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
                { provide: MatDialogRef, useValue: dialogRefSpyObj },
            ],
        });

        TestBed.overrideProvider(BreadcrumbDataService, { useValue: breadcrumbDataServiceSpyObj });
        fixture = TestBed.createComponent(DocumentCopyDialogComponent);
        component = fixture.componentInstance;

        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DocumentCopyDialogComponent>>;
        breadcrumbDataServiceSpyObj.getBreadcrumbData.and.returnValue(of(breadcrumbData));
        breadcrumbDataServiceSpyObj.filterSubfolders.and.returnValue(breadcrumbData);

        hxpNotificationService = TestBed.inject(HxpNotificationService);
        notificationServiceSpy = spyOn(hxpNotificationService, 'openSnackBar');
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    const clickCopyButton = (): void => {
        const copyButtonElement = fixture.debugElement.query(By.css('button.hxp-single-file-copy-btn'));
        copyButtonElement.triggerEventHandler('click', null);
        fixture.detectChanges();
    };

    it('should display search textbox', () => {
        const searchTextboxElement = fixture.debugElement.query(By.css("input[type='text']"));
        expect(searchTextboxElement).toBeTruthy();
    });

    it('should display cancel button', () => {
        const cancelButtonElement = fixture.debugElement.query(By.css('.hxp-copy-dialog-close-button'));
        expect(cancelButtonElement).toBeTruthy();
    });

    it('should display copy button', () => {
        const copyButtonElement = fixture.debugElement.query(By.css('.hxp-single-file-copy-btn'));
        expect(copyButtonElement).toBeTruthy();
    });

    it('should receive selected document as dialog data', () => {
        const data = TestBed.inject(MAT_DIALOG_DATA);
        expect(data.documentToCopy).toEqual(mocks.fileDocument);
    });

    it('should fetch/update and filter breadcrumb data when a folder is selected', (done) => {
        const folder = mocks.folderDocument;
        const mockSubFolders = mocks.nestedDocumentAncestors;

        breadcrumbDataServiceSpyObj.getBreadcrumbData.and.returnValue(
            of({
                parentFolder: ROOT_DOCUMENT,
                currentFolder: folder,
                subFolders: mockSubFolders,
            })
        );

        component.onSelectedFolder({
            document: folder,
            type: BreadcrumbEntryTypes.SELF,
        });

        component.breadcrumbData$.subscribe((data) => {
            expect(breadcrumbDataServiceSpyObj.getBreadcrumbData).toHaveBeenCalledWith({
                document: folder,
                type: BreadcrumbEntryTypes.SELF,
            });

            expect(data?.subFolders.length).toBe(2);
            expect(data?.subFolders.some((sf) => sf.sys_id === dialogData.documentToCopy.sys_id)).toBeFalse();

            done();
        });
    });

    it('should perform copy and update action and close dialog on successful copy', fakeAsync(() => {
        const fileId = dialogData.documentToCopy.sys_id;
        const fileName = dialogData.documentToCopy.sys_name;

        component.onSelectedFolder({
            document: mocks.fileDocument,
            type: BreadcrumbEntryTypes.PARENT,
        });
        fixture.detectChanges();
        documentServiceSpyObj.copyDocument.and.returnValue(of({ document: mocks.fileDocument, status: CopyStatus.SUCCESS }));
        documentServiceSpyObj.updateDocument.and.returnValue(of(mocks.fileDocument));

        clickCopyButton();
        fixture.detectChanges();

        expect(documentServiceSpyObj.copyDocument).toHaveBeenCalledWith(
            fileId,
            `COPY.DIALOG.FILE_NAME_PREFIX ${fileName}`,
            breadcrumbData.currentFolder.sys_id
        );
        expect(documentServiceSpyObj.updateDocument).toHaveBeenCalledWith(fileId, { sys_title: `COPY.DIALOG.FILE_NAME_PREFIX ${fileName}` });
        expect(notificationServiceSpy).toHaveBeenCalledWith('SNACKBAR.COPY.FILE_SUCCESS', 'done');
        expect(dialogRefSpy.close).toHaveBeenCalled();
    }));

    it('should display error notification message when copy fails', () => {
        component.onSelectedFolder({
            document: mocks.fileDocument,
            type: BreadcrumbEntryTypes.PARENT,
        });
        fixture.detectChanges();

        documentServiceSpyObj.copyDocument.and.returnValue(of(CopyStatus.ERROR));
        clickCopyButton();
        fixture.detectChanges();

        expect(notificationServiceSpy).toHaveBeenCalledWith('SNACKBAR.COPY.FILE_ERROR', 'error');
    });

    it('should disable copy button if user has no "Add Children" permission on selected folder', async () => {
        component.onSelectedFolder({
            document: {
                ...mocks.folderDocument,
                sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
            },
            type: BreadcrumbEntryTypes.PARENT,
        });

        await fixture.whenStable();
        fixture.detectChanges();

        const copyButtonElement = fixture.debugElement.query(By.css('.hxp-single-file-copy-btn'));
        expect(copyButtonElement).toBeTruthy();
        expect(copyButtonElement.nativeElement.disabled).toBeFalsy();

        breadcrumbDataServiceSpyObj.getBreadcrumbData.and.returnValue(
            of({
                parentFolder: ROOT_DOCUMENT,
                currentFolder: {
                    ...mocks.folderDocument,
                    sys_effectivePermissions: [],
                },
                subFolders: [],
            })
        );

        component.onSelectedFolder({
            document: {
                ...mocks.folderDocument,
                sys_effectivePermissions: [],
            },
            type: BreadcrumbEntryTypes.PARENT,
        });

        await fixture.whenStable();
        fixture.detectChanges();

        expect(copyButtonElement.nativeElement.disabled).toBeTruthy();
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        component.onSelectedFolder({
            document: {
                ...mocks.folderDocument,
                sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
            },
            type: BreadcrumbEntryTypes.PARENT,
        });
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-dialog-fixed-size-wrapper');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
