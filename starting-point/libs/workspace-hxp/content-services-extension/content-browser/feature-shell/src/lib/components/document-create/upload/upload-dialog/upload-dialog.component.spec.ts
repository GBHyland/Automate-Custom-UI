/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentUploadDialogComponent } from './upload-dialog.component';
import { Subject, of } from 'rxjs';
import { ContentUploadListComponent } from '../upload-list/upload-list.component';
import { ContentUploadPropertiesEditorComponent } from '../upload-properties-editor/upload-properties-editor.component';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
    DataColumnComponent,
    DataColumnListComponent,
    DataTableComponent,
    NoopTranslateModule,
    ToolbarComponent,
    UserPreferencesService,
} from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { CheckboxHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { DocumentModelService } from '@alfresco/adf-hx-content-services/services';
import { MockProvider, MockService } from 'ng-mocks';
import { DocumentLocationPickerComponent } from '../../../document-location-picker/document-location-picker.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FolderIconComponent, MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { DocumentCategoryPickerComponent } from '../../../document-category-picker/document-category-picker.component';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { generateMockUploadData, UploadDialogService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { MatIconModule } from '@angular/material/icon';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [
    { 'aria-progressbar-name': 2 },
    { 'aria-required-children': 3 },
    { 'aria-valid-attr-value': 4 },
    { 'nested-interactive': 2 },
];

describe('ContentUploadDialogComponent', () => {
    let component: ContentUploadDialogComponent;
    let fixture: ComponentFixture<ContentUploadDialogComponent>;

    const mockUploadDialogService = jasmine.createSpyObj('UploadDialogService', [
        'addToQueue',
        'clearQueue',
        'completeQueuedUploads',
        'isFileUploadAborted',
        'isFileUploadCanceled',
        'isFileUploadErrored',
        'isUploadOngoing',
    ]);
    const mockDocumentModelService = MockService(DocumentModelService);

    const getDialogComponents = () => {
        return {
            titleElement: fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog__title')),
            uploadListElement: fixture.debugElement.query(By.css('hxp-workspace-upload-list')),
            uploadPropertiesEditorElement: fixture.debugElement.query(By.css('hxp-workspace-upload-properties-editor')),
            closeDialogButton: fixture.debugElement.query(By.css('#hxp-workspace-upload-dialog-close')),
            submitButton: fixture.debugElement.query(By.css('#hxp-workspace-upload-dialog-upload')),
            deleteSelectionButton: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__delete_button')),
        };
    };

    const setupTestingModule = () => {
        return async () => {
            await TestBed.configureTestingModule({
                imports: [
                    CommonModule,
                    NoopAnimationsModule,
                    OverlayModule,
                    NoopTranslateModule,
                    FolderIconComponent,
                    MimeTypeIconComponent,
                    DocumentCategoryPickerComponent,
                    DocumentLocationPickerComponent,
                    MatTooltipModule,
                    MatExpansionModule,
                    MatIconModule,
                    MatIconTestingModule,
                    MatProgressBarModule,
                    FormsModule,
                    ReactiveFormsModule,
                    DataColumnComponent,
                    DataColumnListComponent,
                    DataTableComponent,
                    ToolbarComponent,
                    ContentUploadListComponent,
                    ContentUploadPropertiesEditorComponent,
                    ContentUploadDialogComponent,
                ],
                providers: [
                    mockHxcsJsClientConfigurationService,
                    MockProvider(UserPreferencesService, {
                        select: () => of('ltr') as any,
                    }),
                    {
                        provide: UploadDialogService,
                        useValue: mockUploadDialogService,
                    },
                    {
                        provide: DocumentModelService,
                        useValue: mockDocumentModelService,
                    },
                ],
            }).compileComponents();

            mockUploadDialogService.newUploads = new Subject();
            mockUploadDialogService.queueChanged = new Subject();
            mockUploadDialogService.uploadError = new Subject();
            mockUploadDialogService.uploadCanceled = new Subject();
            mockUploadDialogService.uploadCompleted = new Subject();
            mockUploadDialogService.uploadRetried = new Subject();

            mockDocumentModelService.getModel = () => of();

            fixture = TestBed.createComponent(ContentUploadDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        };
    };

    beforeEach(setupTestingModule());

    it("shouldn't allow submitting the upload if required properties are missing", () => {
        component.currentDocument = mocks.folderDocument;
        let dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeFalsy();

        mockUploadDialogService.newUploads.next(generateMockUploadData());
        fixture.detectChanges();

        dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeTruthy();

        const { titleElement, uploadListElement, uploadPropertiesEditorElement, closeDialogButton, submitButton } = getDialogComponents();

        expect(titleElement).toBeTruthy();
        expect(titleElement.nativeElement.textContent.trim()).toBe('FILE_UPLOAD.DIALOG.TITLE.MULTIPLE_FILES');
        expect(uploadListElement).toBeTruthy();
        expect(uploadPropertiesEditorElement).toBeTruthy();
        expect(closeDialogButton).toBeTruthy();
        expect(closeDialogButton.nativeElement.disabled).toBeFalsy();
        expect(submitButton).toBeTruthy();
        expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should allow submitting the upload if required properties are set', () => {
        component.currentDocument = mocks.folderDocument;

        const testData = generateMockUploadData();
        let dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeFalsy();

        mockUploadDialogService.newUploads.next(testData);
        fixture.detectChanges();

        dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeTruthy();

        const { titleElement, uploadListElement, uploadPropertiesEditorElement, closeDialogButton, submitButton } = getDialogComponents();

        expect(titleElement).toBeTruthy();
        expect(titleElement.nativeElement.textContent.trim()).toBe('FILE_UPLOAD.DIALOG.TITLE.MULTIPLE_FILES');
        expect(uploadListElement).toBeTruthy();
        expect(uploadPropertiesEditorElement).toBeTruthy();
        expect(closeDialogButton).toBeTruthy();
        expect(closeDialogButton.nativeElement.disabled).toBeFalsy();
        expect(submitButton).toBeTruthy();
        expect(submitButton.nativeElement.disabled).toBeTruthy();

        testData[0].documentModel.document.sys_path = mocks.folderDocument.sys_path;
        testData[1].documentModel.document.sys_path = mocks.folderDocument.sys_path;

        component.onUploadUpdate();
        fixture.detectChanges();

        expect(submitButton.nativeElement.disabled).toBeFalsy();
    });

    it('should cancel upload if deleted from the list', async () => {
        component.currentDocument = mocks.folderDocument;
        const onUploadSelectionSpy = spyOn(component, 'onUploadSelection').and.callThrough();
        const onUploadDeleteSelectionSpy = spyOn(component, 'onUploadDelete').and.callThrough();
        const cancelUploadSpy = spyOn(component, 'cancelUpload').and.callFake(() => {});
        const dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeFalsy();

        mockUploadDialogService.newUploads.next([...generateMockUploadData()]);
        fixture.detectChanges();

        component.onUploadUpdate();
        fixture.detectChanges();

        expect(cancelUploadSpy).not.toHaveBeenCalled();
        expect(onUploadDeleteSelectionSpy).not.toHaveBeenCalled();
        expect(onUploadSelectionSpy).toHaveBeenCalledWith(undefined);

        onUploadSelectionSpy.calls.reset();

        const checkboxList = await CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: false,
            },
        });

        expect(checkboxList).toHaveSize(3);
        await checkboxList[1].check();
        fixture.detectChanges();

        expect(onUploadSelectionSpy).toHaveBeenCalled();
        expect(onUploadDeleteSelectionSpy).not.toHaveBeenCalled();
        expect(cancelUploadSpy).not.toHaveBeenCalled();

        const { deleteSelectionButton } = getDialogComponents();

        expect(deleteSelectionButton).toBeTruthy();

        deleteSelectionButton.nativeElement.click();
        fixture.detectChanges();

        expect(onUploadDeleteSelectionSpy).toHaveBeenCalled();
        expect(cancelUploadSpy).toHaveBeenCalled();
    });

    it('should reopen dialog if new uploads are added', async () => {
        mockUploadDialogService.isUploadOngoing.and.returnValue(true);
        component.currentDocument = mocks.folderDocument;

        const testData = generateMockUploadData();
        const closeDialogSpy = spyOn(component, 'close').and.callThrough();
        let dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeFalsy();

        mockUploadDialogService.newUploads.next(testData);
        fixture.detectChanges();

        component.onUploadUpdate();
        fixture.detectChanges();

        dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeTruthy();

        let { closeDialogButton, submitButton } = getDialogComponents();

        expect(closeDialogButton).toBeTruthy();
        expect(closeDialogButton.nativeElement.disabled).toBeFalsy();
        expect(submitButton).toBeTruthy();
        expect(submitButton.nativeElement.disabled).toBeFalsy();

        submitButton.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();
        dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        ({ closeDialogButton, submitButton } = getDialogComponents());

        expect(closeDialogSpy).toHaveBeenCalled();
        expect(dialogPanel).toBeFalsy();

        mockUploadDialogService.newUploads.next(testData);
        fixture.detectChanges();
        dialogPanel = fixture.debugElement.query(By.css('.hxp-workspace-upload-dialog'));

        expect(dialogPanel).toBeTruthy();
    });

    // flaky test failing randomly
    // eslint-disable-next-line ban/ban
    xit('should pass accessibility checks', async () => {
        component.currentDocument = mocks.folderDocument;
        mockUploadDialogService.newUploads.next(generateMockUploadData());
        fixture.detectChanges();

        const res = await a11yReport('.hxp-workspace-upload-dialog');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
