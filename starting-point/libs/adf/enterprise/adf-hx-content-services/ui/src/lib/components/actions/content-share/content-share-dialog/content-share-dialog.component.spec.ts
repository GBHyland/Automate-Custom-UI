/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContentShareDialogComponent, DialogData } from './content-share-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ContentShareService, HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { MockService } from 'ng-mocks';

describe('ContentShareDialogComponent', () => {
    let component: ContentShareDialogComponent;
    let fixture: ComponentFixture<ContentShareDialogComponent>;
    let contentShareService: ContentShareService;
    let notificationService: HxpNotificationService;
    let clipboard: Clipboard;
    let fb: FormBuilder;
    let dialogRefSpyObj: DialogData;

    const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, ContentShareDialogComponent],
            providers: [Clipboard, { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }],
        });

        fixture = TestBed.createComponent(ContentShareDialogComponent);
        component = fixture.componentInstance;
        contentShareService = TestBed.inject(ContentShareService);
        notificationService = TestBed.inject(HxpNotificationService);
        clipboard = TestBed.inject(Clipboard);
        jest.spyOn(clipboard, 'copy').mockImplementation(jest.fn());
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should receive document id as dialog data', () => {
        fb = new FormBuilder();
        dialogRefSpyObj = { sharedDocument: jestMocks.fileDocument };
        contentShareService = MockService(ContentShareService);
        clipboard = MockService(Clipboard);
        notificationService = MockService(HxpNotificationService);

        component = new ContentShareDialogComponent(fb, dialogRefSpyObj, contentShareService, clipboard, notificationService);

        expect(component.data.sharedDocument).toEqual(jestMocks.fileDocument);
    });

    it('should display read-only textbox', () => {
        const textboxElement = fixture.debugElement.query(By.css('input[type="text"]'));
        expect(textboxElement).toBeTruthy();
        expect(textboxElement.nativeElement.readOnly).toBeTruthy();
    });

    it('should display the value inside textbox returned by the contentShareService', () => {
        const textboxElement = fixture.debugElement.query(By.css('input[type="text"]'));
        const result = contentShareService.getSingleContentShareLink(jestMocks.fileDocument);
        component.shareDocumentForm.patchValue({ shared_link: result });
        fixture.detectChanges();
        expect(textboxElement.nativeElement.value).toBe(result);
    });

    it('should copy the text to the clipboard when the copy button is clicked', async () => {
        const result = contentShareService.getSingleContentShareLink(jestMocks.fileDocument);
        component.shareDocumentForm.patchValue({ shared_link: result });
        fixture.nativeElement.querySelector('.hxp-shared-link-copy-button').click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve, 500));
        expect(clipboard.copy).toHaveBeenCalledWith(result as string);
    });

    it('should show notification when copy button is clicked', async () => {
        jest.spyOn(notificationService, 'openSnackBar').mockImplementation(() => {});
        fixture.nativeElement.querySelector('.hxp-shared-link-copy-button').click();
        fixture.detectChanges();
        expect(notificationService.openSnackBar).toHaveBeenCalledTimes(1);
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        const result = contentShareService.getSingleContentShareLink(jestMocks.fileDocument);
        component.shareDocumentForm.patchValue({ shared_link: result });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-dialog-fixed-size-wrapper');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
