/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @cspell/spellchecker */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DeleteVersionDialogComponent } from './delete-version-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DocumentVersionsService } from '@alfresco/adf-hx-content-services/services';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { By } from '@angular/platform-browser';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('DeleteVersionDialogComponent', () => {
    let fixture: ComponentFixture<DeleteVersionDialogComponent>;
    let loader: HarnessLoader;
    let mockDocumentVersionsService: DocumentVersionsService;
    let component: DeleteVersionDialogComponent;

    beforeEach(waitForAsync(() => {
        mockDocumentVersionsService = {
            deleteVersion: jest.fn(),
        } as Partial<DocumentVersionsService> as DocumentVersionsService;

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, NoopTranslateModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { sys_id: '123', sysver_title: 'Version 1' } },
                { provide: DocumentVersionsService, useValue: mockDocumentVersionsService },
                { provide: MatDialogRef, useValue: { close: () => {} } },
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(DeleteVersionDialogComponent);
                component = fixture.componentInstance;
                loader = TestbedHarnessEnvironment.loader(fixture);
            });
    }));

    it('should show delete confirmation message', async () => {
        const dialogHarness = await loader.getHarness(MatDialogHarness);
        const title = await dialogHarness.getTitleText();
        const contentText = await dialogHarness.getText();

        expect(title).toBe('MANAGE_VERSIONS.DELETE_DIALOG.TITLE');
        expect(contentText).toContain('MANAGE_VERSIONS.DELETE_DIALOG.DESCRIPTION');
    });

    it('should close the dialog when cancel button is clicked', () => {
        const dialogRef = TestBed.inject(MatDialogRef);
        const spyClose = jest.spyOn(dialogRef, 'close');

        const cancelButton = fixture.debugElement.query(By.css('button[mat-dialog-close]'));
        cancelButton.nativeElement.click();
        fixture.detectChanges();

        expect(spyClose).toHaveBeenCalled();
    });

    it('should emit versionDeleted$ and show spinner when delete is called', async () => {
        jest.spyOn(component.versionDeleted$, 'next');
        let spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(spinner).toBeNull();

        const deleteButton = fixture.debugElement.query(By.css('[data-automation-id="confirm-delete"]'));
        deleteButton.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.isDeleting).toBe(true);
        expect(component.versionDeleted$.next).toHaveBeenCalledWith(true);

        spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(spinner).not.toBeNull();

        component.isDeleting = false;
        fixture.detectChanges();
        await fixture.whenStable();

        spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

        expect(spinner).toBeNull();
    });
});
