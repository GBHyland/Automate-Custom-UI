/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentMoveDialogComponent, MoveDialogData } from './document-move-dialog.component';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { DocumentService, HxpNotificationService, MoveStatus } from '@alfresco/adf-hx-content-services/services';
import { of } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbData, BreadcrumbDataService, BreadcrumbEntryTypes } from '../../../services/breadcrumb-data.service';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('DocumentMoveDialogComponent', () => {
    const mockDialogData: MoveDialogData = {
        parentDocument: ROOT_DOCUMENT,
        documentToMove: mocks.fileDocument,
        shouldRefresh: true,
    };

    let fixture: ComponentFixture<DocumentMoveDialogComponent>;
    let component: DocumentMoveDialogComponent;
    let breadcrumbDataServiceSpyObj: any;
    let documentServiceSpyObj: any;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DocumentMoveDialogComponent>>;
    let hxpNotificationService: HxpNotificationService;

    const breadcrumbData: BreadcrumbData = {
        parentFolder: mocks.folderDocument,
        currentFolder: mocks.folderDocument,
        subFolders: mocks.nestedDocumentAncestors,
        totalCount: 2,
    };

    const clickMoveButton = (): void => {
        const moveButtonElement = fixture.debugElement.query(By.css('button.hxp-single-file-move-button'));
        moveButtonElement.triggerEventHandler('click', null);
        fixture.detectChanges();
    };

    beforeEach(() => {
        const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        dialogRefSpyObj.afterClosed.and.returnValue(of());
        breadcrumbDataServiceSpyObj = jasmine.createSpyObj('BreadcrumbDataService', ['getBreadcrumbData', 'filterSubfolders', 'resetPagination']);
        documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['moveDocument', 'requestReload']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, DocumentMoveDialogComponent, NoopTranslateModule, NoopAnimationsModule, RouterTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpyObj },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                {
                    provide: DocumentService,
                    useValue: { requestReload: () => {} },
                },
                mockHxcsJsClientConfigurationService,
                {
                    provide: BreadcrumbDataService,
                    useValue: breadcrumbDataServiceSpyObj,
                },
                { provide: DocumentService, useValue: documentServiceSpyObj },
            ],
        });

        TestBed.overrideProvider(BreadcrumbDataService, { useValue: breadcrumbDataServiceSpyObj });
        breadcrumbDataServiceSpyObj.getBreadcrumbData.and.returnValue(of(breadcrumbData));
        breadcrumbDataServiceSpyObj.filterSubfolders.and.returnValue(breadcrumbData);

        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DocumentMoveDialogComponent>>;
        hxpNotificationService = TestBed.inject(HxpNotificationService);
        fixture = TestBed.createComponent(DocumentMoveDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should display search textbox', () => {
        const searchTextboxElement = fixture.debugElement.query(By.css('input[type="text"]'));
        expect(searchTextboxElement).toBeTruthy();
    });

    it('should display Move button', () => {
        const textboxElement = fixture.debugElement.query(By.css('button.hxp-single-file-move-button'));
        expect(textboxElement).toBeTruthy();
    });

    it('should receive selected file as dialog data', () => {
        const data: MoveDialogData = TestBed.inject(MAT_DIALOG_DATA);
        expect(data.documentToMove).toEqual(mocks.fileDocument);
    });

    it('move button is disabled when target folder is same as the move file parent folder', async () => {
        (component as any).moveDocument = mocks.folderDocument;
        component.onSelectedFolder({
            document: mocks.folderDocument,
            type: BreadcrumbEntryTypes.SELF,
        });

        fixture.detectChanges();

        await fixture.whenStable();
        fixture.detectChanges();

        const moveButton = fixture.debugElement.nativeElement.querySelector('.hxp-single-file-move-button');
        expect(moveButton.disabled).toBeTruthy();
    });

    it('move button is enabled when target folder is not same as the move file parent folder', async () => {
        component.onSelectedFolder({
            document: mocks.fileDocument,
            type: BreadcrumbEntryTypes.PARENT,
        });
        fixture.detectChanges();

        await fixture.whenStable();
        fixture.detectChanges();

        const moveButton = fixture.debugElement.nativeElement.querySelector('.hxp-single-file-move-button');
        expect(moveButton.disabled).toBeFalsy();
    });

    it('should perform move and update action and close dialog on successful move', () => {
        const fileId = mockDialogData.documentToMove.sys_id;
        const notificationServiceSpy = spyOn(hxpNotificationService, 'openSnackBar');
        documentServiceSpyObj.moveDocument.and.returnValue(of({ document: mocks.fileDocument, status: MoveStatus.SUCCESS }));
        component.onSelectedFolder({
            document: mocks.fileDocument,
            type: BreadcrumbEntryTypes.PARENT,
        });
        fixture.detectChanges();
        clickMoveButton();
        fixture.detectChanges();

        expect(documentServiceSpyObj.moveDocument).toHaveBeenCalledWith(fileId, breadcrumbData.currentFolder.sys_id);
        expect(notificationServiceSpy).toHaveBeenCalledWith('SNACKBAR.MOVE.FILE_SUCCESS', 'done');
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        component.onSelectedFolder({
            document: mocks.fileDocument,
            type: BreadcrumbEntryTypes.PARENT,
        });
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-dialog-fixed-size-wrapper');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
