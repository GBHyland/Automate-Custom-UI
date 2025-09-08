/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { DocumentImportProgressDialogComponent } from './document-import-progress.dialog';
import { DocumentImportStatus } from '../../services/document-import/idp-document-import-dialog.service';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { DocumentImportingStatus } from '../../store/states/importing-document.state';
import { By } from '@angular/platform-browser';

describe('DocumentUploadProgressDialogComponent', () => {
    let component: DocumentImportProgressDialogComponent;
    let fixture: ComponentFixture<DocumentImportProgressDialogComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let mockEntries$: BehaviorSubject<DocumentImportStatus[]>;
    let mockEntries: DocumentImportStatus[];

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        mockEntries = [
            {
                fileId: '1',
                fileName: 'test1.pdf',
                progress$: new BehaviorSubject(0),
                errorCode$: new BehaviorSubject(undefined),
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending),
            },
            {
                fileId: '2',
                fileName: 'test2.pdf',
                progress$: new BehaviorSubject(30),
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending),
                errorCode$: new BehaviorSubject(undefined),
            },
        ];
        mockEntries$ = new BehaviorSubject<DocumentImportStatus[]>(mockEntries);

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: mockEntries$ },
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
            ],
        });

        fixture = TestBed.createComponent(DocumentImportProgressDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize with entries from MAT_DIALOG_DATA', fakeAsync(() => {
        expect(component.documents$).toBe(mockEntries$);

        let entriesResult: DocumentImportStatus[] | undefined;
        component.documents$.subscribe((entries) => (entriesResult = entries));

        flush();

        expect(entriesResult).toEqual(mockEntries);
    }));

    it('should respond to changes in documents$', fakeAsync(() => {
        let currentEntries: DocumentImportStatus[] | undefined;
        component.documents$.subscribe((entries) => (currentEntries = entries));

        flush();

        expect(currentEntries).toEqual(mockEntries);

        const updatedEntries: DocumentImportStatus[] = [
            {
                fileId: '1',
                fileName: 'test1-updated.pdf',
                progress$: new BehaviorSubject(100),
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete),
                errorCode$: new BehaviorSubject(undefined),
            },
        ];
        mockEntries$.next(updatedEntries);

        flush();

        expect(currentEntries).toEqual(updatedEntries);
    }));

    it('should generate section for each documents$ entry', () => {
        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress"]'));
        expect(elements.length).toEqual(mockEntries.length);
    });

    it('should show progress percentage when some documents$ entry with status pending or progress', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress-percentage"]'));
        expect(elements.length).toEqual(3);
    });

    it('should show cancel button when some documents$ entry with status pending, progress', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id^="idp-document-upload-progress-dialog__cancel-one-button"]'));
        expect(elements.length).toEqual(3);
    });

    it('should call onCancel when idp-document-upload-progress-dialog__cancel-one-button activated', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const item = fixture.debugElement.query(
            By.css(`[data-automation-id="idp-document-upload-progress-dialog__cancel-one-button-${documents[1].fileId}"]`)
        );

        spyOn(component, 'onCancel');

        item.triggerEventHandler('click');
        expect(component.onCancel).toHaveBeenCalledWith([documents[1]]);

        item.triggerEventHandler('keyup', { key: 'Enter' });
        expect(component.onCancel).toHaveBeenCalledWith([documents[1]]);

        item.triggerEventHandler('keyup', { key: 'Space' });
        expect(component.onCancel).toHaveBeenCalledWith([documents[1]]);
    });

    it('should show complete indicator when some documents$ entry with status complete', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Error),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete),
            },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__complete-indicator"]'));
        expect(elements.length).toEqual(2);
    });

    it('should show cancelled indicator when some documents$ entry with status cancelled', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__cancelled-indicator"]'));
        expect(elements.length).toEqual(2);
    });

    it('should show error indicator when some documents$ entry with status error', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Error),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled),
            },
            {
                importStatus$: new BehaviorSubject(DocumentImportingStatus.Error),
            },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__error-indicator"]'));
        expect(elements.length).toEqual(2);
    });

    it('should show progress bar when some documents$ entry with status pending, progress or complete', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress-bar"]'));
        expect(elements.length).toEqual(3);
    });

    it('should show progress bar in indeterminate mode when document entry status is pending', async () => {
        const documents = generateDocumentUploadEntryWithPartial([{ importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) }]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const element = fixture.debugElement.query(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress-bar"]'));
        expect(element.attributes['ng-reflect-mode']).toBe('indeterminate');
    });

    it('should show progress bar in determinate mode when document entry status is progress', async () => {
        const documents = generateDocumentUploadEntryWithPartial([{ importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) }]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress-bar"]'));
        expect(elements[0].attributes['ng-reflect-mode']).toBe('determinate');
    });

    it('should show progress bar in determinate mode when document entry status is complete', async () => {
        const documents = generateDocumentUploadEntryWithPartial([{ importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) }]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const element = fixture.debugElement.query(By.css('[data-automation-id="idp-document-upload-progress-dialog__progress-bar"]'));
        expect(element.attributes['ng-reflect-mode']).toBe('indeterminate');
    });

    it('should show cancelled message when some documents$ entry with status cancelled', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__cancelled-message"]'));
        expect(elements.length).toEqual(2);
    });

    it('should show error message when some documents$ entry with status error', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('[data-automation-id="idp-document-upload-progress-dialog__error-message"]'));
        expect(elements.length).toEqual(2);
    });

    it('should call onCancel when idp-document-upload-progress-dialog__cancel-all-button activated', () => {
        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Complete) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Error) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Cancelled) },
        ]);
        component.documents$.next(documents);
        fixture.detectChanges();

        const item = fixture.debugElement.query(By.css('[data-automation-id="idp-document-upload-progress-dialog__cancel-all-button"]'));

        spyOn(component, 'onCancel');

        item.nativeElement.click();
        expect(component.onCancel).toHaveBeenCalledWith(documents);
    });

    it('should emit cancelDocumentUpload on onCancel', () => {
        spyOn(component.cancelDocumentUpload, 'emit');

        const documents = generateDocumentUploadEntryWithPartial([
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending) },
            { importStatus$: new BehaviorSubject(DocumentImportingStatus.Progress) },
        ]);

        component.onCancel(documents);

        expect(component.cancelDocumentUpload.emit).toHaveBeenCalledWith(documents);
    });

    it('should return translation key for error code', () => {
        const result = component.getDocumentUploadErrorTranslationKey(123);
        expect(result).toMatch(/.+\.123/);
    });

    it('should return generic translation key when error code undefined', () => {
        const result = component.getDocumentUploadErrorTranslationKey(undefined);
        expect(result).toMatch(/.+\.GENERIC/);
    });

    describe('static open method', () => {
        it('should open dialog with correct configuration', () => {
            DocumentImportProgressDialogComponent.open(dialogSpy, mockEntries$);

            expect(dialogSpy.open).toHaveBeenCalledWith(
                DocumentImportProgressDialogComponent,
                jasmine.objectContaining({
                    data: mockEntries$,
                })
            );
        });
    });

    function generateDocumentUploadEntryWithPartial(documents: Partial<DocumentImportStatus>[]): DocumentImportStatus[] {
        return documents.map((document, index) => ({
            fileId: `${index}`,
            fileName: `f${index}.jpg`,
            progress$: new BehaviorSubject(0),
            importStatus$: new BehaviorSubject(DocumentImportingStatus.Pending),
            errorCode$: new BehaviorSubject(undefined),
            ...document,
        }));
    }
});
