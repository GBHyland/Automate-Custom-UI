/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VersionEditDialogComponent } from './version-edit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentVersionsService } from '@alfresco/adf-hx-content-services/services';
import { By } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('VersionEditDialogComponent', () => {
    let component: VersionEditDialogComponent;
    let fixture: ComponentFixture<VersionEditDialogComponent>;
    let mockDialogRef: jest.Mocked<MatDialogRef<VersionEditDialogComponent>>;
    let mockDocumentVersionsService: DocumentVersionsService;

    beforeEach(async () => {
        mockDialogRef = {
            close: jest.fn(),
        } as unknown as jest.Mocked<MatDialogRef<VersionEditDialogComponent>>;

        mockDocumentVersionsService = {
            updateVersion: jest.fn(),
        } as Partial<DocumentVersionsService> as DocumentVersionsService;

        await TestBed.configureTestingModule({
            imports: [VersionEditDialogComponent, NoopTranslateModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule],
            providers: [
                FormBuilder,
                DatePipe,
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: { sys_id: '123', sysver_title: 'Version 1', sysver_description: 'Description' } },
                { provide: DocumentVersionsService, useValue: mockDocumentVersionsService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(VersionEditDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize the form with the provided data', () => {
        expect((component as any).form.value.sysver_title).toBe('Version 1');
        expect((component as any).form.value.sysver_description).toBe('Description');
    });

    it('should disable the save button when the form is invalid', () => {
        (component as any).form.controls['sysver_title'].setValue('');
        fixture.detectChanges();

        const saveButton = fixture.debugElement.query(By.css('.hxp-primary-button'));

        expect(saveButton.nativeElement.disabled).toBe(true);
    });

    it('should enable save button when the form is valid', () => {
        (component as any).form.controls['sysver_title'].setValue('New Version Title');
        fixture.detectChanges();

        const saveButton = fixture.debugElement.query(By.css('.hxp-primary-button'));

        expect(saveButton.nativeElement.disabled).toBe(false);
    });
});
