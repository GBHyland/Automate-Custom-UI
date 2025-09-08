/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { MatButtonModule } from '@angular/material/button';
import { HxPCreateDocumentButtonComponent } from './create-document-button.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule } from '@angular/material/menu';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { MatDividerModule } from '@angular/material/divider';
import { ContentUploadDialogComponent } from '../upload/upload-dialog/upload-dialog.component';
import { of, Subject } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { UploadFileButtonComponent } from '../upload/upload-button/upload-button.component';
import { UploadDialogService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

describe('HxPCreateDocumentButtonComponent', () => {
    let component: HxPCreateDocumentButtonComponent;
    let fixture: ComponentFixture<HxPCreateDocumentButtonComponent>;
    const uploadServiceSpy = jasmine.createSpyObj('HxpUploadService', ['']);
    uploadServiceSpy.fileUploadError = new Subject();
    uploadServiceSpy.fileUploadSuccess = new Subject();
    uploadServiceSpy.fileUploadCancelled = new Subject();
    uploadServiceSpy.fileUploadProgress = new Subject();
    const uploadDialogServiceSpy = jasmine.createSpyObj('UploadDialogService', ['uploadFiles', 'newUploads', 'clearQueue']);
    uploadDialogServiceSpy.newUploads = new Subject();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NgIf,
                AsyncPipe,
                MatButtonModule,
                MatDialogModule,
                MatDividerModule,
                MatIconModule,
                MatMenuModule,
                NoopTranslateModule,
                RouterTestingModule,
                HxPCreateDocumentButtonComponent,
                ContentUploadDialogComponent,
                UploadFileButtonComponent,
            ],
            providers: [
                provideHttpClientTesting(),
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: ActivatedRoute, useValue: { url: of([{ path: mocks.folderDocument.sys_path }]) } },
                { provide: HxpUploadService, useValue: uploadServiceSpy },
                { provide: UploadDialogService, useValue: uploadDialogServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(HxPCreateDocumentButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should not be in DOM when document doesn't have `CreateChild` permission", () => {
        component.document = {
            ...mocks.folderDocument,
            sys_effectivePermissions: [],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const createButton = fixture.debugElement.query(By.css('button.hxp-create-document-menu-button'));

        expect(createButton).toBeFalsy();
    });

    it('should be in DOM when document has `CreateChild` permission', () => {
        component.document = {
            ...mocks.folderDocument,
            sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const createButton = fixture.debugElement.query(By.css('button.hxp-create-document-menu-button'));

        expect(createButton).toBeTruthy();
    });
});
