/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentUploadPropertiesEditorComponent } from './upload-properties-editor.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { a11yReport, generateMockResponse, mocks } from '@hxp/workspace-hxp/shared/testing';
import { MockService } from 'ng-mocks';
import { ModelApi } from '@hylandsoftware/hxcs-js-client';
import { MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { SelectHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { DocumentLocationPickerComponent } from '../../../document-location-picker/document-location-picker.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DocumentModelService } from '@alfresco/adf-hx-content-services/services';
import { DocumentCategoryPickerComponent } from '../../../document-category-picker/document-category-picker.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { generateMockUploadData } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { provideContentServicesExtensionContentBrowserFeatureShell } from '../../../../content-services-extension-content-browser-feature-shell.providers';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('ContentUploadPropertiesEditorComponent', () => {
    let component: ContentUploadPropertiesEditorComponent;
    let fixture: ComponentFixture<ContentUploadPropertiesEditorComponent>;

    const mockModelApi: ModelApi = MockService(ModelApi);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                OverlayModule,
                MatExpansionModule,
                MatIconModule,
                MatIconTestingModule,
                FormsModule,
                ReactiveFormsModule,
                NoopTranslateModule,
                DocumentCategoryPickerComponent,
                DocumentLocationPickerComponent,
                ContentUploadPropertiesEditorComponent,
            ],
            providers: [
                provideContentServicesExtensionContentBrowserFeatureShell(),
                FormBuilder,
                DocumentModelService,
                MatIconRegistry,
                { provide: MODEL_API_TOKEN, useValue: mockModelApi },
            ],
        });

        spyOn(mockModelApi, 'getModel')
            .withArgs()
            .and.returnValue(generateMockResponse({ data: mocks.modelApi }));

        fixture = TestBed.createComponent(ContentUploadPropertiesEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display empty selection if no data is provided', () => {
        component.data = [];
        fixture.detectChanges();

        const emptySelectionPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__empty'));
        const editSelectionPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__edit'));

        expect(emptySelectionPanel).toBeTruthy();
        expect(editSelectionPanel).toBeFalsy();
    });

    it('should handle mixed content if data has multiple document categories', () => {
        const data = generateMockUploadData();
        component.data = data;
        component.currentDocument = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        let mixedContentPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__edit__mixed_content'));
        let locationPicker = fixture.debugElement.query(By.css('hxp-document-category-picker'));

        expect(mixedContentPanel).toBeFalsy();
        expect(locationPicker).toBeTruthy();

        component.data = [...data, ...generateMockUploadData(1, 'SysFolder')];
        component.ngOnChanges();
        fixture.detectChanges();

        mixedContentPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__edit__mixed_content'));
        locationPicker = fixture.debugElement.query(By.css('hxp-document-category-picker'));

        expect(mixedContentPanel).toBeTruthy();
        expect(locationPicker).toBeFalsy();

        const enableMixedContentButton = fixture.debugElement.query(By.css('#hxp-upload-properties-enable-mixed-content'));

        expect(enableMixedContentButton).toBeTruthy();

        enableMixedContentButton.nativeElement.click();
        fixture.detectChanges();

        mixedContentPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__edit__mixed_content'));
        locationPicker = fixture.debugElement.query(By.css('hxp-document-category-picker'));

        expect(mixedContentPanel).toBeFalsy();
        expect(locationPicker).toBeTruthy();
    });

    it('save button should be disabled if no properties were edited', () => {
        component.data = generateMockUploadData();
        component.currentDocument = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        const savePropertiesButton = fixture.debugElement.query(By.css('#hxp-upload-properties-editor-save'));

        expect(savePropertiesButton).toBeTruthy();
        expect(savePropertiesButton.nativeElement.disabled).toBeTruthy();
    });

    it('save button should be enabled if some properties were edited', () => {
        component.data = generateMockUploadData();
        component.currentDocument = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        const savePropertiesButton = fixture.debugElement.query(By.css('#hxp-upload-properties-editor-save'));
        const locationElement = fixture.debugElement.query(By.css('#hxp-document-location-picker-selector'));

        expect(savePropertiesButton).toBeTruthy();
        expect(savePropertiesButton.nativeElement.disabled).toBeTruthy();

        locationElement.componentInstance.document = mocks.folderDocument;
        locationElement.componentInstance.selectedLocation.emit(mocks.folderDocument);
        locationElement.componentInstance.ngOnChanges();

        fixture.detectChanges();

        expect(savePropertiesButton.nativeElement.disabled).toBeFalsy();
    });

    it('should save properties on edit', async () => {
        component.data = generateMockUploadData();
        component.currentDocument = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        const documentsUpdatedSpy = spyOn(component.documentsUpdated, 'emit');
        const savePropertiesButton = fixture.debugElement.query(By.css('#hxp-upload-properties-editor-save'));
        let saveNotification = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__toast'));

        expect(savePropertiesButton).toBeTruthy();
        expect(savePropertiesButton.nativeElement.disabled).toBeTruthy();
        expect(saveNotification).toBeFalsy();
        expect(documentsUpdatedSpy).not.toHaveBeenCalled();

        const locationElement = fixture.debugElement.query(By.css('#hxp-document-location-picker-selector'));

        expect(locationElement).toBeTruthy();

        locationElement.componentInstance.document = mocks.folderDocument;
        locationElement.componentInstance.selectedLocation.emit(mocks.folderDocument);
        locationElement.componentInstance.ngOnChanges();
        await SelectHarnessUtils.clickDropdownOptions({
            fixture,
            dropdownFilters: {
                selector: '#hxp-document-category-picker-select',
            },
            optionsFilters: {
                text: 'SysFile',
            },
        });
        fixture.detectChanges();

        expect(savePropertiesButton.nativeElement.disabled).toBeFalsy();

        savePropertiesButton.nativeElement.click();
        fixture.detectChanges();

        expect(documentsUpdatedSpy).toHaveBeenCalled();

        saveNotification = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__toast'));

        expect(saveNotification).toBeTruthy();

        const notificationMessage = fixture.debugElement.query(By.css('.hxp-workspace-upload-properties-editor__toast__message'));

        expect(notificationMessage).toBeTruthy();
        expect(notificationMessage.nativeElement.textContent.trim()).toEqual('FILE_UPLOAD.EDIT.PROPERTIES.ASSIGNED');
    });

    it('should pass accessibility checks', async () => {
        component.data = generateMockUploadData();
        component.currentDocument = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-workspace-upload-properties-editor__edit');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
