/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService } from 'ng-mocks';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentMoveDialogComponent, MoveDialogData } from '../document-move-dialog/document-move-dialog.component';
import { DocumentMoveButtonComponent } from './document-move-button-component';
import { of } from 'rxjs';
import { MatMenuItemHarness } from '@angular/material/menu/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';
import { DocumentCacheService, DocumentPermissions, HXP_DOCUMENT_MOVE_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { DocumentMoveButtonActionService } from './document-move-button-action.service';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'aria-required-parent': 1 }];

describe('DocumentMoveButtonComponent', () => {
    let component: DocumentMoveButtonComponent;
    let fixture: ComponentFixture<DocumentMoveButtonComponent>;
    let loader: HarnessLoader;

    const ROOT_DOCUMENT_WITH_PERMISSIONS = {
        ...ROOT_DOCUMENT,
        sys_effectivePermissions: [DocumentPermissions.DELETE_CHILD],
    };

    const mockDocumentCacheService: DocumentCacheService = MockService(DocumentCacheService);

    const mockDialogData: MoveDialogData = {
        parentDocument: ROOT_DOCUMENT,
        documentToMove: ROOT_DOCUMENT,
        shouldRefresh: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule, NoopTranslateModule, DocumentMoveButtonComponent],
            providers: [
                {
                    provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE,
                    useClass: DocumentMoveButtonActionService,
                },
                mockHxcsJsClientConfigurationService,
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                {
                    provide: DocumentCacheService,
                    useValue: mockDocumentCacheService,
                },
            ],
        });

        fixture = TestBed.createComponent(DocumentMoveButtonComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should be in DOM when file is selected and parent has `DeleteChild` permission.', async () => {
        spyOn(mockDocumentCacheService, 'getDocument');

        component.data = {
            parentDocument: ROOT_DOCUMENT_WITH_PERMISSIONS,
            documents: [mocks.fileDocument],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const menuItem = await loader.getHarness(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItem).toBeTruthy();
        expect(mockDocumentCacheService.getDocument).not.toHaveBeenCalled();
    });

    it("should not be in DOM when parent document doesn't have `DeleteChild` permission", async () => {
        spyOn(mockDocumentCacheService, 'getDocument');

        component.data = {
            parentDocument: ROOT_DOCUMENT,
            documents: [mocks.fileDocument],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const menuItems = await loader.getAllHarnesses(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItems.length).toBe(0);
        expect(mockDocumentCacheService.getDocument).not.toHaveBeenCalled();
    });

    it("should not be in DOM when current document doesn't have `Delete` permission", async () => {
        spyOn(mockDocumentCacheService, 'getDocument');

        component.data = {
            parentDocument: ROOT_DOCUMENT_WITH_PERMISSIONS,
            documents: [{ ...mocks.fileDocument, sys_effectivePermissions: [] }],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const menuItems = await loader.getAllHarnesses(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItems.length).toBe(0);
        expect(mockDocumentCacheService.getDocument).not.toHaveBeenCalled();
    });

    it('should call the move method when button is clicked', async () => {
        spyOn(component, 'onMove');

        component.data = {
            parentDocument: ROOT_DOCUMENT_WITH_PERMISSIONS,
            documents: [mocks.fileDocument],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const menuItem = await loader.getHarness(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItem).toBeTruthy();
        await menuItem.click();
        expect(component.onMove).toHaveBeenCalled();
    });

    it('should fetch parent document if none is provided in the context', async () => {
        spyOn(mockDocumentCacheService, 'getDocument')
            .withArgs(ROOT_DOCUMENT_WITH_PERMISSIONS.sys_id)
            .and.returnValue(of(ROOT_DOCUMENT_WITH_PERMISSIONS));
        spyOn(component, 'onMove');

        component.data = { documents: [mocks.fileDocument] };
        component.ngOnChanges();
        fixture.detectChanges();

        const menuItem = await loader.getHarness(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItem).toBeTruthy();
        expect(mockDocumentCacheService.getDocument).toHaveBeenCalled();
    });

    it('should open move dialog', () => {
        const dialogRef = TestBed.inject(MatDialog);
        const spy = spyOn(dialogRef, 'open');
        component.data = {
            parentDocument: ROOT_DOCUMENT,
            documents: [mocks.fileDocument],
        };
        component.onMove();
        expect(spy).toHaveBeenCalledWith(DocumentMoveDialogComponent, {
            width: DialogConfig.small.width,
            height: DialogConfig.small.height,
            data: {
                parentDocument: ROOT_DOCUMENT,
                documentToMove: mocks.fileDocument,
                shouldRefresh: true,
            },
        });
    });

    it('should not be in DOM if no document is provided', async () => {
        component.data.documents = [];
        fixture.detectChanges();

        const menuItems = await loader.getAllHarnesses(MatMenuItemHarness.with({ selector: '.hxp-move-button' }));
        expect(menuItems.length).toBe(0);
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        component.data = {
            parentDocument: ROOT_DOCUMENT_WITH_PERMISSIONS,
            documents: [mocks.fileDocument],
        };
        component.ngOnChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
