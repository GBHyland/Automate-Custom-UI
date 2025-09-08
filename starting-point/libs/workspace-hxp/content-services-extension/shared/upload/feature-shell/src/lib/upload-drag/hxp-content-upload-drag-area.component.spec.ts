/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentUploadDragAreaComponent } from './hxp-content-upload-drag-area.component';
import { UploadDialogService } from '../services/upload-dialog.service';
import { NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { HxpFileDraggableDirective, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { Subject } from 'rxjs';
import { MockDirective } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('ContentUploadDragAreaComponent', () => {
    let component: ContentUploadDragAreaComponent;
    let fixture: ComponentFixture<ContentUploadDragAreaComponent>;

    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['']);
    const uploadDialogServiceSpy = jasmine.createSpyObj('UploadDialogService', ['uploadFiles']);
    const uploadServiceSpy = jasmine.createSpyObj('HxpUploadService', ['']);
    uploadServiceSpy.fileUploadError = new Subject();
    uploadServiceSpy.fileUploadSuccess = new Subject();

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            declarations: [MockDirective(HxpFileDraggableDirective), ContentUploadDragAreaComponent],
            providers: [
                { provide: HxpUploadService, useValue: uploadServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: UploadDialogService, useValue: uploadDialogServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ContentUploadDragAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        uploadDialogServiceSpy.uploadFiles.calls.reset();
    });

    it('should upload files', () => {
        expect(uploadDialogServiceSpy.uploadFiles).not.toHaveBeenCalled();

        const files = [new File([''], 'file1.txt'), new File([''], 'file2.txt')];

        component.uploadFiles(files);

        expect(uploadDialogServiceSpy.uploadFiles).toHaveBeenCalled();
    });

    it('should upload files on filesDropped event', () => {
        const dropArea = fixture.debugElement.query(By.directive(HxpFileDraggableDirective));

        expect(dropArea).toBeTruthy();

        const files = [new File([''], 'file1.txt'), new File([''], 'file2.txt')];

        dropArea.triggerEventHandler('filesDropped', files);

        expect(uploadDialogServiceSpy.uploadFiles).toHaveBeenCalledWith(jasmine.any(Array));
        expect(uploadDialogServiceSpy.uploadFiles.calls.mostRecent().args[0].length).toBe(2);
    });
});
