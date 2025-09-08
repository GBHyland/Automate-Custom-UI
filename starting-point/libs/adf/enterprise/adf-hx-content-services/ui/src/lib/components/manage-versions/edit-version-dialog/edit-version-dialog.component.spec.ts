/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @cspell/spellchecker */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditVersionDialogComponent } from './edit-version-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentVersionsService } from '@alfresco/adf-hx-content-services/services';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('EditVersionDialogComponent', () => {
    let component: EditVersionDialogComponent;
    let fixture: ComponentFixture<EditVersionDialogComponent>;
    let mockDialogRef: jest.Mocked<MatDialogRef<EditVersionDialogComponent>>;
    let mockDocumentVersionsService: DocumentVersionsService;
    let loader: HarnessLoader;

    beforeEach(async () => {
        mockDialogRef = {
            close: jest.fn(),
        } as unknown as jest.Mocked<MatDialogRef<EditVersionDialogComponent>>;

        mockDocumentVersionsService = {
            updateVersion: jest.fn(),
        } as Partial<DocumentVersionsService> as DocumentVersionsService;

        await TestBed.configureTestingModule({
            imports: [
                EditVersionDialogComponent,
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatProgressSpinnerModule,
                NoopTranslateModule,
            ],
            providers: [
                FormBuilder,
                DatePipe,
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: { sys_id: '123', sysver_title: 'Version 1', sysver_description: 'Description' } },
                { provide: DocumentVersionsService, useValue: mockDocumentVersionsService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EditVersionDialogComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should initialize form with provided version data', () => {
        expect((component as any).form.value.sysver_title).toBe('Version 1');
        expect((component as any).form.value.sysver_description).toBe('Description');
    });

    it('should disable the save button when form is invalid', () => {
        (component as any).form.controls['sysver_title'].setValue('');
        fixture.detectChanges();

        const saveButton = fixture.debugElement.query(By.css('button.hxp-primary-button'));

        expect(saveButton.nativeElement.disabled).toBe(true);
    });

    it('should enable the save button when form is valid', () => {
        (component as any).form.controls['sysver_title'].setValue('New Version Title');
        fixture.detectChanges();

        const saveButton = fixture.debugElement.query(By.css('button.hxp-primary-button'));

        expect(saveButton.nativeElement.disabled).toBe(false);
    });

    it('should emit versionUpdated$ and show spinner when save is called', async () => {
        const spy = jest.spyOn(component.versionUpdated$, 'next');
        let spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(spinner).toBeNull();

        (component as any).form.controls['sysver_title'].setValue('Updated Title');
        (component as any).form.controls['sysver_description'].setValue('Updated Description');
        fixture.detectChanges();

        component.save();
        fixture.detectChanges();
        await fixture.whenStable();

        spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(component.isUpdating).toBe(true);
        expect(spinner).not.toBeNull();
        expect(spy).toHaveBeenCalledWith({
            sys_id: '123',
            sysver_title: 'Updated Title',
            sysver_description: 'Updated Description',
        });

        component.isUpdating = false;
        fixture.detectChanges();
        await fixture.whenStable();

        spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(spinner).toBeNull();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
