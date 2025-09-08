/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadFileButtonComponent } from './upload-button.component';
import { HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { UploadDialogService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

describe('UploadFileButtonComponent', () => {
    let component: UploadFileButtonComponent;
    let fixture: ComponentFixture<UploadFileButtonComponent>;

    const uploadDialogServiceSpy = jasmine.createSpyObj('UploadDialogService', ['uploadFiles']);
    const uploadServiceSpy = jasmine.createSpyObj('HxpUploadService', ['uploadFiles']);
    uploadServiceSpy.fileUploadError = new Subject();
    uploadServiceSpy.fileUploadSuccess = new Subject();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UploadFileButtonComponent, NoopTranslateModule],
            providers: [
                { provide: HxpUploadService, useValue: uploadServiceSpy },
                { provide: UploadDialogService, useValue: uploadDialogServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(UploadFileButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        uploadDialogServiceSpy.uploadFiles.calls.reset();
    });

    it('should hide the button when isAvailable is false', () => {
        component.isAvailable = false;
        fixture.detectChanges();

        const uploadButton = fixture.debugElement.query(By.css('.hxp-workspace-upload-button'));

        expect(uploadButton).toBeFalsy();
    });

    it('should display the button when isAvailable is true', () => {
        component.isAvailable = true;
        fixture.detectChanges();
        const uploadButton = fixture.debugElement.query(By.css('.hxp-workspace-upload-button')).nativeElement;

        expect(uploadButton).toBeTruthy();
    });

    it('should call uploadFiles method when files are added', () => {
        expect(uploadDialogServiceSpy.uploadFiles).not.toHaveBeenCalled();

        const input = fixture.debugElement.query(By.css('#upload-multiple-files'));

        expect(input).toBeTruthy();

        const event = { currentTarget: { files: [new File([''], 'test-file.txt')], value: '' }, target: { value: '' } };
        input.triggerEventHandler('change', event);
        fixture.detectChanges();

        expect(uploadDialogServiceSpy.uploadFiles).toHaveBeenCalled();
    });
});
