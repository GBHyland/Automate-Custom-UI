/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { DocumentUploadButtonComponent } from './upload-button.component';

describe('UploadButtonComponent', () => {
    let component: DocumentUploadButtonComponent;
    let fixture: ComponentFixture<DocumentUploadButtonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
        });

        fixture = TestBed.createComponent(DocumentUploadButtonComponent);
        component = fixture.componentInstance;
    });

    it('should set inputFileAccept when acceptedFileExtensions changes for the first time', () => {
        const acceptedFileExtensions = ['pdf', 'tif'];

        component.acceptedFileExtensions = acceptedFileExtensions;
        component.ngOnChanges({
            acceptedFileExtensions: { previousValue: undefined, currentValue: acceptedFileExtensions, firstChange: true, isFirstChange: () => true },
        });

        expect(component.inputFileAccept).toEqual('.pdf,.tif');
    });

    it('should emit uploadDocuments on onUploadDocuments', () => {
        const file1 = new File([''], 'file1.pdf', { type: 'application/pdf' });
        const file2 = new File([''], 'file2.tif', { type: 'image/tiff' });

        const dt = new DataTransfer();
        dt.items.add(file1);
        dt.items.add(file2);

        const event = { target: { files: dt.files } };

        spyOn(component.uploadDocuments, 'emit');

        component.onUploadDocuments(event);

        expect(component.uploadDocuments.emit).toHaveBeenCalledWith([file1, file2]);
    });

    it('should not emit uploadDocuments on onUploadDocuments when no files selected', () => {
        const event = { target: { files: new DataTransfer().files } };

        spyOn(component.uploadDocuments, 'emit');

        component.onUploadDocuments(event);

        expect(component.uploadDocuments.emit).not.toHaveBeenCalled();
    });
});
