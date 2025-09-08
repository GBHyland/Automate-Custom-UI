/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HxPCreateFolderDialogComponent } from './folder-create-dialog.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentModelService, DocumentService, RouterExtService } from '@alfresco/adf-hx-content-services/services';
import { MockService } from 'ng-mocks';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentCategoryPickerComponent } from '../../../document-category-picker/document-category-picker.component';
import { DocumentLocationPickerComponent } from '../../../document-location-picker/document-location-picker.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { a11yReport, generateMockResponse, mocks } from '@hxp/workspace-hxp/shared/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonHarnessUtils, SelectHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { mockHxcsJsClientConfigurationService, MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { ModelApi } from '@hylandsoftware/hxcs-js-client';
import { Subject } from 'rxjs';
import { CancelFolderDialogComponent } from '../cancel-dialog/cancel-folder-dialog.component';
import { FolderIconComponent, MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('CreateFolderDialogComponent', () => {
    let fixture: ComponentFixture<HxPCreateFolderDialogComponent>;
    let component: HxPCreateFolderDialogComponent;
    const mockDocumentService = MockService(DocumentService);
    const mockRouterExtService = MockService(RouterExtService);
    const mockModelApi: ModelApi = MockService(ModelApi);
    const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    const setupTestingModule = () => {
        return async () => {
            await TestBed.configureTestingModule({
                imports: [
                    CommonModule,
                    BrowserModule,
                    FormsModule,
                    OverlayModule,
                    ReactiveFormsModule,
                    NoopAnimationsModule,
                    NoopTranslateModule,
                    FolderIconComponent,
                    MimeTypeIconComponent,
                    DocumentCategoryPickerComponent,
                    DocumentLocationPickerComponent,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatIconTestingModule,
                    MatFormFieldModule,
                    MatInputModule,
                    HxPCreateFolderDialogComponent,
                ],
                providers: [
                    mockHxcsJsClientConfigurationService,
                    {
                        provide: DocumentService,
                        useValue: mockDocumentService,
                    },
                    { provide: MODEL_API_TOKEN, useValue: mockModelApi },
                    { provide: MatDialogRef, useValue: matDialogRefMock },
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    {
                        provide: RouterExtService,
                        useValue: mockRouterExtService,
                    },
                    DocumentModelService,
                ],
            }).compileComponents();

            mockDocumentService.documentLoaded$ = new Subject();

            spyOn(mockModelApi, 'getModel').and.returnValue(generateMockResponse({ data: mocks.modelApi }));

            fixture = TestBed.createComponent(HxPCreateFolderDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        };
    };

    beforeEach(setupTestingModule());
    it('should display if feature flag enabled', () => {
        const createFolderDialog = fixture.debugElement.query(By.css('.hxp-create-folder-dialog'));
        const existingCreateDialog = fixture.debugElement.query(By.css('hxp-create-document-dialog'));

        expect(createFolderDialog).toBeTruthy();

        expect(existingCreateDialog).toBeFalsy();
    });

    it('should enable create button when all the fields have value', async () => {
        const folderName = component.createDocumentForm.controls['sys_title'];
        folderName.setValue('Test Folder');

        const location = fixture.debugElement.query(By.css('#hxp-document-location-picker-selector'));
        location.componentInstance.document = mocks.folderDocument;
        location.componentInstance.selectedLocation.emit(mocks.folderDocument);
        location.componentInstance.ngOnChanges();

        await SelectHarnessUtils.clickDropdownOptions({
            fixture,
            dropdownFilters: {
                selector: '#hxp-document-category-picker-select',
            },
            optionsFilters: {
                text: 'SysFolder',
            },
        });

        fixture.detectChanges();

        expect(component.selectedLocation).toBeTruthy();

        expect(fixture.debugElement.query(By.css('#hxp-new-folder-name')).nativeElement.value).toBe('Test Folder');

        expect(component.selectedDocumentCategory).toBe('SysFolder');

        const createButton = fixture.debugElement.query(By.css('#hxp-create-folder-button'));

        expect(createButton.nativeElement.disabled).toBeFalse();
    });

    it('should create a folder on `Create Folder` button click', async () => {
        const folderName = component.createDocumentForm.controls['sys_title'];
        folderName.setValue('Test Folder');

        const location = fixture.debugElement.query(By.css('#hxp-document-location-picker-selector'));
        location.componentInstance.document = mocks.folderDocument;
        location.componentInstance.selectedLocation.emit(mocks.folderDocument);
        location.componentInstance.ngOnChanges();

        await SelectHarnessUtils.clickDropdownOptions({
            fixture,
            dropdownFilters: {
                selector: '#hxp-document-category-picker-select',
            },
            optionsFilters: {
                text: 'SysFolder',
            },
        });

        spyOn(mockDocumentService, 'createDocument');
        fixture.detectChanges();

        const createButton = fixture.debugElement.query(By.css('#hxp-create-folder-button'));

        expect(createButton.nativeElement.disabled).toBeFalse();

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '#hxp-create-folder-button',
            },
        });
        const spyCreate = spyOn(component, 'onCreateDocument').and.callThrough();
        component.onCreateDocument();

        fixture.detectChanges();

        expect(spyCreate).toHaveBeenCalled();
    });

    it('should open cancel popup when cancel button clicked', async () => {
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-cancel-button',
            },
        });

        const dialog = TestBed.inject(MatDialog);
        const cancelDialog = dialog.openDialogs.find((d) => d.componentInstance instanceof CancelFolderDialogComponent);

        expect(cancelDialog).toBeTruthy();
    });

    it('should filter system folderish categories', async () => {
        const folderName = component.createDocumentForm.controls['sys_title'];
        folderName.setValue('Test Folder');

        const location = fixture.debugElement.query(By.css('#hxp-document-location-picker-selector'));
        location.componentInstance.document = mocks.folderDocument;
        location.componentInstance.selectedLocation.emit(mocks.folderDocument);
        location.componentInstance.ngOnChanges();

        const dropdown = await SelectHarnessUtils.getDropdown({
            fixture,
            dropdownFilters: {
                selector: '#hxp-document-category-picker-select',
            },
        });
        await dropdown.open();
        const options = await Promise.all((await dropdown.getOptions()).map((option) => option.getText()));

        expect(options).toEqual(['SuperSpecialFolder', 'SysFolder']);
    });

    it('should pass accessibility checks', async () => {
        const res = await a11yReport('.hxp-create-folder-dialog');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
