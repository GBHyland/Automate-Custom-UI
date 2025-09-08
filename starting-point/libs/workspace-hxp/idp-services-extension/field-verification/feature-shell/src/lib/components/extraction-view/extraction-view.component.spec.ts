/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtractionViewComponent } from './extraction-view.component';
import { By } from '@angular/platform-browser';
import { ActionHistoryService, ActionLinearHistoryService } from '../../services/action-history.service';
import { firstValueFrom, isObservable, Observable, of } from 'rxjs';
import { IdpVerificationService } from '../../services/verification/verification.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdpDocument, IdpField } from '../../models/screen-models';
import {
    IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN,
    IdpBackendService,
    IdpContextTaskBaseService,
    IdpFieldDataType,
    IdpFilePageOcrData,
    IdpSharedImageLoadingService,
    IdpShortcutService,
    IdpVerificationStatus,
    ResponseFormat,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectDocument } from '../../store/selectors/document.selectors';
import { documentState, fieldVerificationRootState } from '../../store/shared-mock-states';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MemoizedSelector } from '@ngrx/store';
import { FieldVerificationContextTaskService } from '../../services/context-task/field-verification-context-task.service';
import { selectActiveField } from '../../store/selectors/document-field.selectors';
import { documentFieldFeatureSelector } from '../../store/selectors/field-verification-root.selectors';
import { IdpViewerEventTypes, IdpViewerTextHighlightState } from '@hyland/idp-document-viewer';
import { DOWNLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

class MockIdpContextTaskBaseService {
    taskInfo$ = of({
        taskId: 'task1',
        taskName: 'Task 1',
        taskType: 'Verification',
        issuesToResolve: 1,
        taskLabel: 'EXTRACTION.VERIFICATION.TASK_HEADER.TITLE',
        props: [
            { label: 'EXTRACTION.VERIFICATION.TASK_HEADER.TASK_NAME', value: 'Task 1' },
            { label: 'EXTRACTION.VERIFICATION.TASK_HEADER.CONTENT_TYPE', value: 'Document' },
            { label: 'EXTRACTION.VERIFICATION.TASK_HEADER.TOTAL_PAGES', value: '10' },
        ],
    });
    taskCanSave$ = of(false);
}

describe('ExtractionViewComponent', () => {
    let component: ExtractionViewComponent;
    let fixture: ComponentFixture<ExtractionViewComponent>;
    let imageLoadingService: IdpImageLoadingService;
    let ocrWords: IdpFilePageOcrData['words'];
    let store: MockStore;
    const mockLayout = 'mock layout data 1';

    let mockDocumentSelector: MemoizedSelector<any, IdpDocument>;

    const mockField1 = {
        id: '1',
        name: 'Field 1',
        value: 'Value 1',
        dataType: IdpFieldDataType.Text,
        verificationStatus: IdpVerificationStatus.ManualValid,
        hasIssue: false,
        confidence: 0.95,
        format: 'string',
        isSelected: false,
        boundingBox: {
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            pageId: documentState.pages[0].id,
        },
        // eslint-disable-next-line prettier/prettier
    } satisfies IdpField;

    const mockIdpDocument: IdpDocument = {
        ...documentState,
        hasIssue: true,
        pages: documentState.pages.map((page) => ({
            ...page,
            documentId: documentState.id,
            hasIssue: false,
            isSelected: false,
        })),
    };

    const mockNotificationService = {
        showInfo: () => {},
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExtractionViewComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                provideHttpClient(),
                provideMockStore({
                    initialState: fieldVerificationRootState,
                    selectors: [{ selector: documentFieldFeatureSelector, value: fieldVerificationRootState.fields }],
                }),
                { provide: ActionHistoryService, useClass: ActionLinearHistoryService },
                { provide: NotificationService, useValue: mockNotificationService },
                { provide: IdpContextTaskBaseService, useClass: MockIdpContextTaskBaseService },
                IdpVerificationService,
                IdpImageLoadingService,
                IdpSharedImageLoadingService,
                IdpBackendService,
                FieldVerificationContextTaskService,
                IdpShortcutService,
                { provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, useValue: [] },
                { provide: AppConfigService, useValue: [] },
                { provide: DOWNLOAD_API_TOKEN, useValue: [] },
            ],
        });
        store = TestBed.inject(MockStore);
        store.overrideSelector(selectActiveField, mockField1);
        mockDocumentSelector = store.overrideSelector(selectDocument, mockIdpDocument);

        imageLoadingService = TestBed.inject(IdpImageLoadingService);
        ocrWords = [{ text: 'foobar', confidence: 100, boundingBox: { top: 0, left: 0, width: 0, height: 0 } }];
        spyOn(imageLoadingService, 'getPageOcrData$').and.returnValue(
            of({ fileReference: 'file1', words: ocrWords, layout: mockLayout, status: 'Succeeded' })
        );

        fixture = TestBed.createComponent(ExtractionViewComponent);
        component = fixture.componentInstance;
    });

    function getMetadataInput() {
        return fixture.debugElement.query(By.css('.idp-fields-container input'));
    }

    function inputFieldValue(value: string, metadataInput = getMetadataInput()) {
        metadataInput.nativeElement.value = value;
        metadataInput.nativeElement.dispatchEvent(new Event('input'));
    }

    function triggerPageSelected(currentPageIndex: number, totalPages = mockIdpDocument.pages.length) {
        component.viewerEvent$.next({
            type: 'PageSelected' as any,
            timestamp: '',
            data: {
                dataSourceRef: [],
                newValue: {
                    pageNavInfo: {
                        currentPageIndex,
                        totalPages,
                    },
                },
            },
        });
    }

    function triggerViewChanged(currentLayer: string) {
        component.viewerEvent$.emit({
            type: IdpViewerEventTypes.ViewChanged,
            timestamp: '',
            data: {
                dataSourceRef: [],
                newValue: {
                    currentLayer,
                },
            },
        });
    }

    it('loadPageOcrFn should return layout if responseFormat is TextLayout', async () => {
        const mockThumbnailData = { blobUrl: 'thumbnail-url', width: 100, height: 100, correctionAngle: 360, skew: 0 };
        spyOn(imageLoadingService, 'getImageDataForPage$').and.returnValue(of(mockThumbnailData));
        fixture.detectChanges();

        const datasource = await firstValueFrom(component.viewerDatasource$);

        const ocrResult = datasource.loadPageOcrFn('page0', ResponseFormat.TextLayout);
        const observableResult = isObservable(ocrResult) ? ocrResult : of(ocrResult);
        const result = await firstValueFrom(observableResult);
        expect(result).toBe(mockLayout);
    });

    it('should show the viewer and its container and text layer', () => {
        const viewer = fixture.debugElement.query(By.css('hyland-idp-viewer'));
        expect(viewer).toBeDefined();

        mockDocumentSelector.setResult(mockIdpDocument);
        store.refreshState();
        fixture.detectChanges();

        const viewerContainer = viewer.query(By.css('.idp-viewer-container'));
        expect(viewerContainer).toBeDefined();

        const textLayer = viewer.query(By.css('hyland-idp-viewer-text-layer'));
        expect(textLayer).toBeDefined();
    });

    it('should update viewerHighlights when activeField changes', () => {
        fixture.detectChanges();

        const metadataInput = getMetadataInput();
        metadataInput.nativeElement.focus();

        expect(component.viewerHighlights).toEqual([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
        ]);
    });

    it('should update viewerHighlights when typed value autocompletes to OCR word', async () => {
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        const firstPage = document.pages[0];

        inputFieldValue('foo');

        expect(component.viewerHighlights).toEqual([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
            { text: ocrWords[0].text, ...ocrWords[0].boundingBox, highlightState: IdpViewerTextHighlightState.PRIMARY, pageId: firstPage.id },
        ]);
    });

    it('should not include activeHighlight in viewerHighlights when moving to a different page', async () => {
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        inputFieldValue('foo');

        expect(component.viewerHighlights).toEqual([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
            { text: ocrWords[0].text, ...ocrWords[0].boundingBox, highlightState: IdpViewerTextHighlightState.PRIMARY, pageId: document.pages[0].id },
        ]);

        triggerPageSelected(1);
        expect(component.viewerHighlights).toEqual([
            { text: ocrWords[0].text, ...ocrWords[0].boundingBox, highlightState: IdpViewerTextHighlightState.PRIMARY, pageId: document.pages[1].id },
        ]);

        triggerPageSelected(0);
        expect(component.viewerHighlights).toEqual([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
            { text: ocrWords[0].text, ...ocrWords[0].boundingBox, highlightState: IdpViewerTextHighlightState.PRIMARY, pageId: document.pages[0].id },
        ]);
    });

    it('should not include typeaheadHighlights in viewerHighlights when activeHighlights field value already matches', () => {
        const viewerHighlightsSetter = spyOnProperty(component, 'viewerHighlights', 'set').and.callThrough();

        fixture.detectChanges();
        expect(viewerHighlightsSetter).not.toHaveBeenCalled();

        viewerHighlightsSetter.calls.reset();
        inputFieldValue(mockField1.value);
        expect(viewerHighlightsSetter).toHaveBeenCalledOnceWith([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
        ]);

        viewerHighlightsSetter.calls.reset();
        triggerPageSelected(1);
        expect(viewerHighlightsSetter).toHaveBeenCalledOnceWith([]);

        viewerHighlightsSetter.calls.reset();
        triggerPageSelected(0);
        expect(viewerHighlightsSetter).toHaveBeenCalledOnceWith([
            { text: mockField1.value, ...mockField1.boundingBox, highlightState: IdpViewerTextHighlightState.VALID },
        ]);
    });

    it('should update active field value when text is selected in the viewer', async () => {
        spyOn(imageLoadingService, 'getImageDataForPage$').and.returnValue(of());
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updateField').and.callThrough();
        spyOn(idpVerificationService, 'selectField').and.callThrough();
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        const firstPage = document.pages[0];

        const metadataInput = getMetadataInput();
        metadataInput.nativeElement.focus();

        const selectedText = 'Selected text';
        const textBox = { top: 0, left: 0, width: 100, height: 100, pageId: firstPage.id };

        component.viewerTextSelected.next({
            text: selectedText,
            pageId: firstPage.id,
            rect: {
                actual: textBox,
                scaled: textBox,
                scale: 1,
            },
        });

        expect(idpVerificationService.updateField).toHaveBeenCalledWith(jasmine.objectContaining({ value: selectedText }), textBox);
        expect(idpVerificationService.selectField).toHaveBeenCalledWith(jasmine.objectContaining({ value: selectedText }), true);
    });

    it('should intelligently round fractional bounding boxes', async () => {
        spyOn(imageLoadingService, 'getImageDataForPage$').and.returnValue(of());
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updateField').and.callThrough();
        spyOn(idpVerificationService, 'selectField').and.callThrough();
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        const firstPage = document.pages[0];

        const metadataInput = getMetadataInput();
        metadataInput.nativeElement.focus();

        const selectedText = 'Selected text';
        const textBox = { top: 9.8, left: 10.1, width: 100.5, height: 99.1, pageId: firstPage.id };

        component.viewerTextSelected.next({
            text: selectedText,
            pageId: firstPage.id,
            rect: {
                actual: textBox,
                scaled: textBox,
                scale: 1,
            },
        });

        expect(idpVerificationService.updateField).toHaveBeenCalledWith(jasmine.objectContaining({ value: selectedText }), {
            ...textBox,
            top: 9,
            left: 10,
            width: 101,
            height: 100,
        });
        expect(idpVerificationService.selectField).toHaveBeenCalledWith(jasmine.objectContaining({ value: selectedText }), true);
    });

    it('should configure loadThumbnailFn to load thumbnail data', async () => {
        const mockThumbnailData = { blobUrl: 'thumbnail-url', width: 100, height: 100, correctionAngle: 360, skew: 0 };
        spyOn(imageLoadingService, 'getImageDataForPage$').and.returnValue(of(mockThumbnailData));
        fixture.detectChanges();

        const datasource = await firstValueFrom(component.viewerDatasource$);
        const thumbnailData = await firstValueFrom(datasource.loadThumbnailFn('page1') as Observable<string>);

        expect(imageLoadingService.getImageDataForPage$).toHaveBeenCalledWith('page1', true);
        expect(thumbnailData).toBe('thumbnail-url');
    });

    it('should set confidence to 1 when text is selected from OCR', async () => {
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updateField').and.callThrough();
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        const firstPage = document.pages[0];

        const metadataInput = getMetadataInput();
        metadataInput.nativeElement.focus();

        const selectedText = 'Selected text';
        const textBox = { top: 0, left: 0, width: 100, height: 100, pageId: firstPage.id };

        component.viewerTextSelected.next({
            text: selectedText,
            pageId: firstPage.id,
            rect: {
                actual: textBox,
                scaled: textBox,
                scale: 1,
            },
        });

        expect(idpVerificationService.updateField).toHaveBeenCalledWith(
            jasmine.objectContaining({
                value: selectedText,
                confidence: 1,
            }),
            textBox
        );
    });

    it('should update field with confidence 1 and selected text when field previously had no value', async () => {
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        const noValueField = { ...mockField1, value: '', boundingBox: undefined };
        store.overrideSelector(selectActiveField, noValueField);
        store.refreshState();

        spyOn(idpVerificationService, 'updateField').and.callThrough();
        fixture.detectChanges();

        const document = await firstValueFrom(component.document$);
        const firstPage = document.pages[0];
        const selectedText = 'New OCR Text';
        const textBox = { top: 10, left: 10, width: 50, height: 20, pageId: firstPage.id };

        component.viewerTextSelected.next({
            text: selectedText,
            pageId: firstPage.id,
            rect: {
                actual: textBox,
                scaled: textBox,
                scale: 1,
            },
        });

        expect(idpVerificationService.updateField).toHaveBeenCalledWith(
            jasmine.objectContaining({
                value: selectedText,
                confidence: 1,
                boundingBox: textBox,
            }),
            textBox
        );
    });

    describe('text layer visibility', () => {
        function getTextLayer() {
            return fixture.debugElement.query(By.css('hyland-idp-viewer-text-layer'));
        }

        it('should show text layer by default', () => {
            fixture.detectChanges();
            expect(component.showTextLayer).toBeTrue();
            expect(getTextLayer()).toBeDefined();
        });

        it('should hide text layer when view changes to TextOnly', () => {
            fixture.detectChanges();
            triggerViewChanged('TextOnly');
            fixture.detectChanges();

            expect(component.showTextLayer).toBeFalse();
            expect(getTextLayer()).toBeNull();
        });

        it('should show text layer when view changes from TextOnly to another view', () => {
            fixture.detectChanges();
            triggerViewChanged('TextOnly');
            fixture.detectChanges();

            expect(component.showTextLayer).toBeFalse();
            expect(getTextLayer()).toBeNull();

            triggerViewChanged('Image');
            fixture.detectChanges();

            expect(component.showTextLayer).toBeTrue();
            expect(getTextLayer()).toBeDefined();
        });

        it('should not emit multiple times when same layer is selected', () => {
            fixture.detectChanges();
            const changes: string[] = [];

            component.viewerEvent$.subscribe((event) => {
                changes.push(event.type);
            });

            triggerViewChanged('TextOnly');
            triggerViewChanged('TextOnly');
            triggerViewChanged('TextOnly');

            expect(changes.length).toBe(3);
            expect(changes.every((type) => type === IdpViewerEventTypes.ViewChanged)).toBeTrue();
            expect(component.showTextLayer).toBeFalse();
            expect(getTextLayer()).toBeNull();
        });
    });

    it('should update page rotation metadata when rotation changes', () => {
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updatePagesRotation').and.callThrough();

        fixture.detectChanges();

        const document = mockIdpDocument;
        const firstPage = document.pages[0];
        const secondPage = document.pages[1];

        component.viewerEvent$.emit({
            type: IdpViewerEventTypes.RotationChanged,
            timestamp: '',
            data: {
                dataSourceRef: [
                    { pageId: firstPage.id, documentId: document.id, viewerRotation: 90 },
                    { pageId: secondPage.id, documentId: document.id, viewerRotation: 90 },
                ],
                newValue: {
                    rotationStep: 90,
                },
            },
        });

        expect(idpVerificationService.updatePagesRotation).toHaveBeenCalledWith(
            [
                { pageId: firstPage.id, documentId: document.id, viewerRotation: 90 },
                { pageId: secondPage.id, documentId: document.id, viewerRotation: 90 },
            ],
            false
        );
    });

    it('should not update page rotation metadata if no pages are provided in rotation event', () => {
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updatePagesRotation').and.callThrough();

        fixture.detectChanges();

        component.viewerEvent$.emit({
            type: IdpViewerEventTypes.RotationChanged,
            timestamp: '',
            data: {
                dataSourceRef: [],
                newValue: {
                    rotationStep: 90,
                },
            },
        });

        expect(idpVerificationService.updatePagesRotation).not.toHaveBeenCalled();
    });

    it('should handle rotation changes for a single page', () => {
        const idpVerificationService = TestBed.inject(IdpVerificationService);
        spyOn(idpVerificationService, 'updatePagesRotation').and.callThrough();

        fixture.detectChanges();

        const document = mockIdpDocument;
        const firstPage = document.pages[0];

        component.viewerEvent$.emit({
            type: IdpViewerEventTypes.RotationChanged,
            timestamp: '',
            data: {
                dataSourceRef: [{ pageId: firstPage.id, documentId: document.id, viewerRotation: 180 }],
                newValue: {
                    rotationStep: 180,
                },
            },
        });

        expect(idpVerificationService.updatePagesRotation).toHaveBeenCalledWith(
            [{ pageId: firstPage.id, documentId: document.id, viewerRotation: 180 }],
            false
        );
    });

    it('should show the extraction table in the splitter when showTable is true', () => {
        fixture.detectChanges();

        // Find the metadata panel component
        const metadataPanelDebug = fixture.debugElement.query(By.css('hyland-idp-extraction-metadata-panel'));
        expect(metadataPanelDebug).toBeTruthy();

        // Emit the showTable event as the child would
        metadataPanelDebug.triggerEventHandler('showTable');
        fixture.detectChanges();

        // There should be two splitter panes
        const splitterPanes = fixture.debugElement.queryAll(
            By.css('[data-automation-id="idp-viewer-splitter-pane-document"], [data-automation-id="idp-viewer-splitter-pane-table"]')
        );
        expect(splitterPanes.length).toBe(2);

        // The second pane should contain the extraction table
        const tablePane = splitterPanes[1];
        const extractionTable = tablePane.query(By.css('hyland-idp-extraction-table'));
        expect(extractionTable).toBeTruthy();
    });

    it('should not show the extraction table when showTable is false', () => {
        component.showTable = false;
        fixture.detectChanges();

        // There should be only one splitter pane
        const splitterPanes = fixture.debugElement.queryAll(
            By.css('[data-automation-id="idp-viewer-splitter-pane-document"], [data-automation-id="idp-viewer-splitter-pane-table"]')
        );
        expect(splitterPanes.length).toBe(1);

        // No extraction table should be present
        const extractionTable = fixture.debugElement.query(By.css('hyland-idp-extraction-table'));
        expect(extractionTable).toBeNull();
    });
});
