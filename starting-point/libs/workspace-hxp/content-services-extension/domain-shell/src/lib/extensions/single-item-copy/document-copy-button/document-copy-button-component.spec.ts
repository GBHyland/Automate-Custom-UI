/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentCopyButtonComponent } from './document-copy-button-component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentCopyDialogComponent } from '../document-copy-dialog/document-copy-dialog.component';
import { MockService } from 'ng-mocks';
import { CopyButtonActionService } from './document-copy-button-action.service';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';
import { DocumentCacheService, HXP_DOCUMENT_COPY_ACTION_SERVICE, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { NoopTranslateModule } from '@alfresco/adf-core';

const mockDocumentCacheService: DocumentCacheService = MockService(DocumentCacheService);

// https://hyland.atlassian.net/browse/HXCS-5189
const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'aria-required-parent': 1 }];

describe('DocumentCopyButtonComponent', () => {
    let component: DocumentCopyButtonComponent;
    let fixture: ComponentFixture<DocumentCopyButtonComponent>;
    let button: DebugElement;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, DocumentCopyButtonComponent],
            providers: [
                {
                    provide: DocumentCacheService,
                    useValue: mockDocumentCacheService,
                },
                { provide: MatDialog, useValue: dialogSpyObj },
                {
                    provide: HXP_DOCUMENT_COPY_ACTION_SERVICE,
                    useClass: CopyButtonActionService,
                },
            ],
        });

        fixture = TestBed.createComponent(DocumentCopyButtonComponent);
        component = fixture.componentInstance;
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    function clickCopyButton() {
        button = fixture.debugElement.query(By.css('button.hxp-copy-button'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
    }

    it('should open the copy dialog when onCopy is called with dialogData', () => {
        component.data.parentDocument = {
            ...ROOT_DOCUMENT,
            sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
        };
        component.data.documents = [mocks.fileDocument];
        component.ngOnChanges();
        fixture.detectChanges();
        const dialogData = {
            parentDocument: component.data.parentDocument,
            documentToCopy: component.data.documents[0],
        };
        expect(dialogSpy.open).not.toHaveBeenCalled();
        clickCopyButton();
        expect(dialogSpy.open).toHaveBeenCalledWith(DocumentCopyDialogComponent, {
            width: DialogConfig.small.width,
            height: DialogConfig.small.height,
            data: dialogData,
        });
    });

    it('should not be in DOM if no document is provided', () => {
        component.data.documents = [];
        button = fixture.debugElement.query(By.css('button.hxp-copy-button'));
        expect(button).toBeFalsy();
    });

    it('should pass accessibility checks', async () => {
        component.data.parentDocument = {
            ...ROOT_DOCUMENT,
            sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
        };
        component.data.documents = [mocks.fileDocument];
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
