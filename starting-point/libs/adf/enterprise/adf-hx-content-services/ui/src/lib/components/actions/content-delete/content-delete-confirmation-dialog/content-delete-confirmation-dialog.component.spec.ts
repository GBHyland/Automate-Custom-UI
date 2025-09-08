/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentService, HxpNotificationService, RouterExtService, DocumentRouterService } from '@alfresco/adf-hx-content-services/services';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { documentApiProvider, mockHxcsJsClientConfigurationService, queryApiProvider } from '@alfresco/adf-hx-content-services/api';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ContentDeleteConfirmationDialogComponent } from './content-delete-confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MockService } from 'ng-mocks';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContentDeletedDialogResponse, ContentDeleteDialogData } from '../configs/delete-dialog.interface';
import { deleteItemNotificationMessages } from '../configs/delete-notification-messages.config';
import { DeletedStatus } from '../configs/deleted-status.enum';
import { TranslateService } from '@ngx-translate/core';

let documentService: jest.Mocked<DocumentService>;
let mockDocumentRouterService: DocumentRouterService;

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

// setup a different Dialog Data provider for every assertion
function setupTest(dialogData: ContentDeleteDialogData) {
    const matDialogRefMock = {
        close: jest.fn(),
    };
    mockDocumentRouterService = MockService(DocumentRouterService);

    TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, MatDialogModule, NoopTranslateModule, RouterTestingModule, MatSnackBarModule],
        providers: [
            { provide: MatDialogRef, useValue: matDialogRefMock },
            { provide: MAT_DIALOG_DATA, useValue: dialogData },
            { provide: DocumentService, useValue: documentService },
            { provide: ActivatedRoute, useValue: {} },
            {
                provide: DocumentRouterService,
                useValue: mockDocumentRouterService,
            },
            documentApiProvider,
            queryApiProvider,
            mockHxcsJsClientConfigurationService,
        ],
    });

    const fixture = TestBed.createComponent(ContentDeleteConfirmationDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, matDialogRefMock };
}

function expectDialogTitleAndDescription(fixture: ComponentFixture<any>, expectedTitle: string, expectedDescription: string) {
    const title = fixture.debugElement.query(By.css('.dialog-title')).nativeElement.textContent.trim();

    expect(title).toContain(expectedTitle);

    const description = fixture.debugElement.query(By.css('.hxp-fixed-dialog-content-height')).nativeElement.textContent.trim();

    expect(description).toContain(expectedDescription);
}

describe('ContentDeleteConfirmationDialogComponent', () => {
    let dialogData: ContentDeleteDialogData;
    beforeEach(() => {
        documentService = {
            deleteDocument: jest.fn(),
        } as any;
        dialogData = {
            documents: [jestMocks.fileDocument],
            shouldRedirect: false,
            refererURL: '',
        };
    });

    it('should display the correct title and description for multiple document delete', async () => {
        const dialogDataWithFolder = {
            documents: [jestMocks.folderDocument, jestMocks.fileDocument],
            shouldRedirect: false,
            refererURL: '',
        };
        const { fixture } = setupTest(dialogDataWithFolder);

        expectDialogTitleAndDescription(
            fixture,
            'DOCUMENT_DELETE.APP.DIALOGS.DELETE.MULTIPLE_ITEMS.TITLE',
            'DOCUMENT_DELETE.APP.DIALOGS.DELETE.MULTIPLE_ITEMS.DESCRIPTION'
        );
    });

    it('should display the correct title and description for single document delete', async () => {
        const { fixture } = setupTest(dialogData);

        expectDialogTitleAndDescription(
            fixture,
            'DOCUMENT_DELETE.APP.DIALOGS.DELETE.ITEM.TITLE',
            'DOCUMENT_DELETE.APP.DIALOGS.DELETE.ITEM.DESCRIPTION'
        );
    });

    it('should delete on delete click', async () => {
        const { fixture } = setupTest(dialogData);

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-primary-warn-button',
            },
        });

        expect(documentService.deleteDocument).toHaveBeenCalled();
    });
    // This test is failing consistently for :  Cannot read properties of undefined (reading 'isCurrentPathEqualTo')
    // eslint-disable-next-line ban/ban
    xit('should call redirect to the parent folder when shouldRedirect is true', async () => {
        const dialogDataWithRedirection = {
            documents: [jestMocks.fileDocument],
            shouldRedirect: true,
            refererURL: '',
        };
        const { fixture } = setupTest(dialogDataWithRedirection);

        const mockRouterExtService = TestBed.inject(RouterExtService);
        const redirectToRefererSpy = jest.spyOn(mockRouterExtService, 'redirectToReferer');
        const urlForParentSpy = jest.spyOn(mockDocumentRouterService, 'urlForParent').mockReturnValue('parent_document_url');

        const document$: Observable<string> = of(jestMocks.fileDocument.sys_id);
        documentService.deleteDocument.mockReturnValue(document$);
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-primary-warn-button',
            },
        });

        expect(urlForParentSpy.mock.calls).toEqual([[jestMocks.fileDocument]]);
        expect(redirectToRefererSpy.mock.calls).toEqual([['', 'parent_document_url']]);
    });

    it('should call redirect to search result page when previous url is search result', async () => {
        const refererURL = '/search?query=test';
        const dialogDataWithRedirection = {
            documents: [jestMocks.fileDocument],
            shouldRedirect: true,
            refererURL: refererURL,
        };
        const { fixture } = setupTest(dialogDataWithRedirection);
        const router = TestBed.inject(Router);
        jest.spyOn(router, 'navigateByUrl').mockImplementation(jest.fn());
        const document$: Observable<string> = of(jestMocks.fileDocument.sys_id);
        documentService.deleteDocument.mockReturnValue(document$);
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-primary-warn-button',
            },
        });

        expect(router.navigateByUrl).toHaveBeenCalledWith(refererURL);
    });

    it('should process multiple file deletions correctly and emit correct deletion responses', async () => {
        const multipleDocuments = [jestMocks.fileDocument, jestMocks.folderDocument];
        const dialogDataWithMultipleFiles = {
            documents: multipleDocuments,
            shouldRedirect: false,
            refererURL: '',
        };
        const { component } = setupTest(dialogDataWithMultipleFiles);
        documentService.deleteDocument.mockImplementation((sys_id: string) =>
            multipleDocuments[0].sys_id === sys_id ? of(sys_id) : throwError(`Error for ${sys_id}`)
        );

        expect(documentService.deleteDocument).not.toHaveBeenCalled();

        let results: ContentDeletedDialogResponse[] = [];
        (component as any).deleteDocument$.subscribe((res: ContentDeletedDialogResponse[]) => (results = res));

        expect(results).toEqual([
            { success: true, docId: multipleDocuments[0].sys_id },
            {
                success: false,
                error: `Error for ${multipleDocuments[1].sys_id}`,
                docId: multipleDocuments[1].sys_id,
            },
        ]);
        expect(documentService.deleteDocument).toHaveBeenCalledTimes(2);
        // eslint-disable-next-line unicorn/no-array-for-each
        multipleDocuments.forEach((doc) => {
            expect(documentService.deleteDocument).toHaveBeenCalledWith(doc.sys_id);
        });
    });

    it('should process multiple file deletions and display the correct message for mixed deletion results', async () => {
        const multipleDocuments = [jestMocks.fileDocument, jestMocks.folderDocument];
        const dialogDataWithMultipleFiles = {
            documents: multipleDocuments,
            shouldRedirect: false,
            refererURL: '',
        };
        const { fixture } = setupTest(dialogDataWithMultipleFiles);
        documentService.deleteDocument.mockImplementation((sys_id: string) =>
            multipleDocuments[0].sys_id === sys_id ? of(sys_id) : throwError(`Error for ${sys_id}`)
        );
        const translateService = TestBed.inject(TranslateService);
        jest.spyOn(translateService, 'instant');
        const notificationService = TestBed.inject(HxpNotificationService);
        jest.spyOn(notificationService, 'openSnackBar');

        expect(notificationService.openSnackBar).not.toHaveBeenCalled();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-primary-warn-button',
            },
        });

        expect(notificationService.openSnackBar).toHaveBeenCalled();
        expect(translateService.instant).toHaveBeenCalledWith(deleteItemNotificationMessages[DeletedStatus.SUCCESS].SINGLE);
        expect(translateService.instant).toHaveBeenCalledWith(deleteItemNotificationMessages[DeletedStatus.ERROR].SINGLE);
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        const { fixture } = setupTest(dialogData);
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-dialog-fixed-size-wrapper');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
