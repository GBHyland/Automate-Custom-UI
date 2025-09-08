/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HxpUploadService } from '../services/hxp-upload.service';
import { UploadHxpButtonComponent } from './upload-hxp-button.component';
import { FileModel } from '../model/file.model';
import { MockProvider } from 'ng-mocks';
import { AuthenticationService, LogService, NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

describe('UploadButtonComponent', () => {
    const file = {
        name: 'fake-name-1',
        size: 10,
        webkitRelativePath: 'fake-folder1/fake-name-1.json',
    };
    const fakeEvent = {
        currentTarget: {
            files: [file],
        },
        target: { value: 'fake-name-1' },
    };

    let component: UploadHxpButtonComponent;
    let fixture: ComponentFixture<UploadHxpButtonComponent>;
    let uploadService: HxpUploadService;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [CommonModule, MatIconModule, NoopTranslateModule, UploadHxpButtonComponent],
            providers: [
                { provide: AuthenticationService, useValue: {} },
                MockProvider(HxpUploadService, {
                    fileUploadError: new Subject(),
                    fileUploadSuccess: new Subject(),
                }),
                MockProvider(LogService),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UploadHxpButtonComponent);
        uploadService = TestBed.inject(HxpUploadService);

        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    afterEach(() => {
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should render upload-single-file button as default', () => {
        component.multipleFiles = false;
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file')).toBeDefined();
    });

    it('should render upload-multiple-file button if multipleFiles is true', () => {
        component.multipleFiles = true;
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-files')).toBeDefined();
    });

    it('should render an uploadFolder button if uploadFolder is true', () => {
        component.uploadFolders = true;
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder')).toBeDefined();
    });

    it('should have input type as button if receiving a file as input', () => {
        component.multipleFiles = false;
        component.file = new File([], 'Fake file name');
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        const inputButton = compiled.querySelector('#upload-single-file');
        expect(inputButton.type).toBe('button');

        component.file = undefined;
        fixture.detectChanges();
        expect(inputButton.type).toBe('file');
    });

    it('should disable uploadFolder button if disabled is true', () => {
        component.disabled = true;
        component.uploadFolders = true;
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder').getAttribute('disabled')).toBe('true');
    });

    it('should disable upload-single-file button if disabled is true', () => {
        component.disabled = true;
        component.multipleFiles = false;
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file').getAttribute('disabled')).toBe('true');
    });

    it('should add files to service queue on file upload', () => {
        spyOn(uploadService, 'uploadFilesInTheQueue').and.stub();
        fixture.detectChanges();

        component.onFilesAdded(fakeEvent);
        expect(uploadService.uploadFilesInTheQueue).toHaveBeenCalled();
    });

    it('should by default the title of the button get from the JSON file', () => {
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        component.uploadFolders = false;
        component.multipleFiles = false;

        expect(compiled.querySelector('#upload-single-file-label').innerText).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FILE');

        component.multipleFiles = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-file-label').innerText).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FILE');

        component.uploadFolders = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder-label').innerText).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FOLDER');
    });

    it('should staticTitle properties change the title of the upload buttons', () => {
        const compiled = fixture.debugElement.nativeElement;
        component.staticTitle = 'test-text';
        component.uploadFolders = false;
        component.multipleFiles = false;

        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file-label-static').textContent.trim()).toEqual('test-text');

        component.multipleFiles = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-file-label-static').textContent.trim()).toEqual('test-text');

        component.uploadFolders = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder-label-static').textContent.trim()).toEqual('test-text');
    });

    describe('fileSize', () => {
        const files: File[] = [{ name: 'bigFile.png', size: 1000 } as File, { name: 'smallFile.png', size: 10 } as File];

        let addToQueueSpy: jasmine.Spy<(...fileModels: FileModel[]) => FileModel[]>;

        beforeEach(() => {
            addToQueueSpy = spyOn(uploadService, 'addToQueue');
        });

        afterEach(() => {
            fixture.destroy();
            TestBed.resetTestingModule();
        });

        it('should filter out file, which are too big if max file size is set', () => {
            component.maxFilesSize = 100;

            component.uploadFiles(files);

            const filesCalledWith = addToQueueSpy.calls.mostRecent().args;
            expect(filesCalledWith.length).toBe(1);
            expect(filesCalledWith[0].name).toBe('smallFile.png');
        });

        it('should filter out all files if maxFilesSize is 0', () => {
            component.maxFilesSize = 0;

            component.uploadFiles(files);

            expect(addToQueueSpy.calls.mostRecent()).toBeUndefined();
        });

        it('should allow file of 0 size when the max file size is set to 0', () => {
            const zeroFiles: File[] = [{ name: 'zeroFile.png', size: 0 } as File];
            component.maxFilesSize = 0;

            component.uploadFiles(zeroFiles);

            expect(addToQueueSpy.calls.mostRecent()).toBeDefined();
        });

        it('should filter out all files if maxFilesSize is <0', () => {
            component.maxFilesSize = -2;

            component.uploadFiles(files);

            expect(addToQueueSpy.calls.mostRecent()).toBeUndefined();
        });

        it('should output an error when you try to upload a file too big', () => {
            component.maxFilesSize = 100;

            component.errorUpload.subscribe((res) => {
                expect(res).toBeDefined();
            });

            component.uploadFiles(files);
        });

        it('should not filter out files if max file size is not set', () => {
            component.maxFilesSize = undefined;

            component.uploadFiles(files);

            const filesCalledWith = addToQueueSpy.calls.mostRecent().args;
            expect(filesCalledWith.length).toBe(2);
        });
    });

    describe('uploadFiles', () => {
        const files: File[] = [
            { name: 'phobos.jpg', size: 10 } as File,
            { name: 'deimos.png', size: 10 } as File,
            { name: 'ganymede.bmp', size: 10 } as File,
        ];

        let addToQueueSpy: jasmine.Spy<(...fileModels: FileModel[]) => FileModel[]>;

        beforeEach(() => {
            addToQueueSpy = spyOn(uploadService, 'addToQueue');
        });

        afterEach(() => {
            fixture.destroy();
            TestBed.resetTestingModule();
        });

        it('should filter out file, which is not part of the acceptedFilesType', () => {
            component.acceptedFilesType = '.jpg';

            component.uploadFiles(files);

            const filesCalledWith = addToQueueSpy.calls.mostRecent().args;
            expect(filesCalledWith.length).toBe(1); // Files should contain only one element
            expect(filesCalledWith[0].name).toBe('phobos.jpg'); // png file should be filtered out;
        });

        it('should filter out files, which are not part of the acceptedFilesType', () => {
            component.acceptedFilesType = '.jpg,.png';

            component.uploadFiles(files);

            const filesCalledWith = addToQueueSpy.calls.mostRecent().args;
            expect(filesCalledWith.length).toBe(2); // Files should contain two elements;
            expect(filesCalledWith[0].name).toBe('phobos.jpg');
            expect(filesCalledWith[1].name).toBe('deimos.png');
        });

        it('should not filter out anything if acceptedFilesType is wildcard', () => {
            component.acceptedFilesType = '*';

            component.uploadFiles(files);

            const filesCalledWith = addToQueueSpy.calls.mostRecent().args;
            expect(filesCalledWith.length).toBe(3); // Files should contain all elements
            expect(filesCalledWith[0].name).toBe('phobos.jpg');
            expect(filesCalledWith[1].name).toBe('deimos.png');
            expect(filesCalledWith[2].name).toBe('ganymede.bmp');
        });

        it('should not add any file to que if everything is filtered out', () => {
            component.acceptedFilesType = 'doc';

            component.uploadFiles(files);

            expect(addToQueueSpy).not.toHaveBeenCalled();
        });
    });
});
