/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ViewerTextLayerService } from './viewer-text-layer.service';
import { ViewerService } from './viewer.service';
import { ViewerLayerHostData } from '../models/viewer-layer';
import { BehaviorSubject, firstValueFrom, of, Subject } from 'rxjs';
import { ViewerTextData } from '../models/text-layer/ocr-candidate';
import { Rect, TextRect } from '../models/text-layer/size';
import { DrawStyles } from '../models/text-layer/drawing-config';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { RubberBandPrimitive } from '../models/text-layer/rubber-band-primitive';
import { Clipboard } from '@angular/cdk/clipboard';
import { NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { ViewerModifierKey, ViewerShortcutAction, ViewerShortcutService } from './viewer-shortcut.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';
import { ResponseFormat } from '../models/datasource';

const mockChangeDetector = {
    detectChanges: jasmine.createSpy(),
};

describe('Idp Viewer ViewerTextLayerService', () => {
    let service: ViewerTextLayerService;
    let viewerService: ViewerService;
    let clipboard: Clipboard;
    let shortcutService: ViewerShortcutService;
    const mockViewerKeyboardEvent$ = new BehaviorSubject<KeyboardEvent>(new KeyboardEvent('keydown'));
    const mockTextLayout = 'This is the text layout';
    class MockViewerService implements Partial<ViewerService> {
        datasource$ = of({
            documents: [
                {
                    id: 'doc1',
                    name: 'document 1',
                    pages: [
                        { id: 'p1', name: 'page 1', isSelected: true },
                        { id: 'p2', name: 'page 2', isSelected: false },
                    ],
                },
            ],
            loadImageFn: () => ({ width: 800, height: 600, blobUrl: '', viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => '',
            loadPageOcrFn: (_pageId: string, format: ResponseFormat) => {
                if (format === ResponseFormat.TextLayout) {
                    return mockTextLayout;
                }
                return [
                    { pageId: 'p1', text: 'text 1', top: 10, left: 20, width: 30, height: 40 },
                    { pageId: 'p1', text: 'text 2', top: 50, left: 60, width: 70, height: 80 },
                ];
            },
        });
        changePageById = jasmine.createSpy('changePageById');
        viewerKeyboardEvent$ = mockViewerKeyboardEvent$.asObservable();
    }

    const hostData: ViewerLayerHostData = {
        documentId: 'doc1',
        pageId: 'p1',
        contentNaturalWidth: 500,
        contentNaturalHeight: 1000,
    };

    const currentSizeInfo: Rect = { top: 0, left: 0, width: 250, height: 500 };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule],
            providers: [
                ViewerTextLayerService,
                { provide: ChangeDetectorRef, useValue: mockChangeDetector },
                { provide: ViewerService, useClass: MockViewerService },
                Clipboard,
                NotificationService,
                ViewerShortcutService,
            ],
        });

        service = TestBed.inject(ViewerTextLayerService);
        viewerService = TestBed.inject(ViewerService);
        shortcutService = TestBed.inject(ViewerShortcutService);
        clipboard = TestBed.inject(Clipboard);
    });

    it('should throw error with invalid host data', () => {
        const invalidHostData: ViewerLayerHostData = {
            documentId: '',
            pageId: '',
            contentNaturalWidth: -1,
            contentNaturalHeight: -1,
        };

        expect(() => service.initialize(invalidHostData)).toThrowError();
    });

    it('should set and get back scaled active highlights', fakeAsync(() => {
        const highlights: ViewerTextData[] = [
            { pageId: 'p1', text: 'text 1', top: 10, left: 20, width: 30, height: 40, highlightState: DrawStyles.DEFAULT },
        ];

        let scaledHighlight: HighlightPrimitive | undefined;

        service.scaledActiveHighlights$.subscribe((items) => {
            scaledHighlight = items[0];
        });

        service.setActivePrimitives(highlights);
        expect(scaledHighlight).toBeUndefined();

        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        tick(100);

        expect(scaledHighlight?.actualRect).toEqual({
            top: highlights[0].top,
            left: highlights[0].left,
            width: highlights[0].width,
            height: highlights[0].height,
        });
        expect(scaledHighlight?.rect).toEqual({
            top: highlights[0].top / 2,
            left: highlights[0].left / 2,
            width: highlights[0].width / 2,
            height: highlights[0].height / 2,
        });
    }));

    it('should emit tooltip text on hover over text', fakeAsync(() => {
        let result: TextRect | undefined;
        service.tooltip$.subscribe((data) => {
            result = data[0];
        });

        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        service.onMouseMove({ offsetX: 20, offsetY: 10, buttons: 0 } as unknown as MouseEvent);
        tick(100);
        expect(result).toEqual({ text: 'text 1', top: 30, left: 10, width: 15, height: 20 });

        service.onMouseMove({ offsetX: 50, offsetY: 5, buttons: 0 } as unknown as MouseEvent);
        tick(100);
        expect(result).toBeUndefined();

        service.onMouseMove({ offsetX: 50, offsetY: 60, buttons: 0 } as unknown as MouseEvent);
        tick(100);
        expect(result).toEqual({ text: 'text 2', top: 70, left: 30, width: 35, height: 40 });
    }));

    it('should draw rubber band on mouse down and up', fakeAsync(() => {
        const expectedRubberBandRect: Rect = { top: 4, left: 15, width: 121, height: 132 };
        let rubberBandResult: RubberBandPrimitive | undefined;
        (service.rubberBandAreaSelection$ as Subject<RubberBandPrimitive | undefined>).subscribe((data) => {
            rubberBandResult = data;
        });

        let textSelectionResult: string | undefined;
        service.textSelection$.subscribe((data) => {
            textSelectionResult = data.text;
        });

        service.onResize({ top: 0, left: 0, width: 500, height: 1000 });
        service.initialize(hostData);
        tick(100);

        service.onMouseDown({ offsetX: 5, offsetY: 5, button: 0 } as unknown as MouseEvent);
        tick(50);
        expect(rubberBandResult).toBeUndefined();

        service.onMouseMove({ offsetX: 5, offsetY: 5 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 100, offsetY: 100 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 200, offsetY: 200 } as unknown as MouseEvent);
        tick(100);
        expect(rubberBandResult?.rect).toEqual({ top: 5, left: 5, width: 195, height: 195 });

        service.onMouseUp({ offsetX: 200, offsetY: 200, button: 0 } as unknown as MouseEvent);
        tick(50);
        expect(rubberBandResult?.rect).toEqual(expectedRubberBandRect);

        service.onMouseClick({ offsetX: 100, offsetY: 100 } as unknown as MouseEvent);
        service.onMouseClick({ offsetX: 100, offsetY: 100 } as unknown as MouseEvent);
        tick(500);
        expect(rubberBandResult?.rect).toEqual(expectedRubberBandRect);
        expect(textSelectionResult).toEqual('text 1 text 2');

        service.onMouseDown({ offsetX: 350, offsetY: 350, button: 0 } as unknown as MouseEvent);
        tick(50);
        expect(rubberBandResult).toBeUndefined();
    }));

    it('should emit text selected on mouse double click text selection', (done) => {
        service.textSelection$.subscribe((data) => {
            expect(data).toEqual({
                pageId: 'p1',
                text: 'text 1',
                rect: {
                    actual: { top: 10, left: 20, width: 30, height: 40 },
                    scaled: { top: 5, left: 10, width: 15, height: 20 },
                    scale: 0.5,
                },
                additionalData: undefined,
            });
            done();
        });

        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);
        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);
    });

    it('should change page if active highlight is not on current page', fakeAsync(() => {
        const highlights: ViewerTextData[] = [
            { pageId: 'p2', text: 'text 1', top: 10, left: 20, width: 30, height: 40, highlightState: DrawStyles.DEFAULT },
        ];
        service.setAutoNavigationToHighlight(true);
        service.initialize(hostData);
        tick(100);
        service.setActivePrimitives(highlights);

        expect(viewerService.changePageById).toHaveBeenCalledWith('p2');
    }));

    it('should not change page if auto navigation to highlight is disabled', fakeAsync(() => {
        const highlights: ViewerTextData[] = [
            { pageId: 'p2', text: 'text 1', top: 10, left: 20, width: 30, height: 40, highlightState: DrawStyles.DEFAULT },
        ];
        service.setAutoNavigationToHighlight(false);
        service.initialize(hostData);
        tick(100);
        service.setActivePrimitives(highlights);

        expect(viewerService.changePageById).not.toHaveBeenCalled();
    }));

    it('should copy text to clipboard on mouse double click on text', (done) => {
        spyOn(clipboard, 'copy');

        service.textSelection$.subscribe((data) => {
            expect(data).toEqual({
                pageId: 'p1',
                text: 'text 1',
                rect: {
                    actual: { top: 10, left: 20, width: 30, height: 40 },
                    scaled: { top: 5, left: 10, width: 15, height: 20 },
                    scale: 0.5,
                },
                additionalData: undefined,
            });
            expect(clipboard.copy).toHaveBeenCalled();
            done();
        });

        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);
        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);
    });

    it('should not copy text to clipboard on mouse double click on text when handle clipboard is false', async () => {
        spyOn(clipboard, 'copy');
        service.setHandleClipboard(false);

        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);
        service.onMouseClick({ offsetX: 20, offsetY: 10 } as unknown as MouseEvent);

        const textSelection = await firstValueFrom(service.textSelection$);
        expect(textSelection).toBeDefined();
        expect(clipboard.copy).not.toHaveBeenCalled();
    });

    it('should copy text to clipboard on ctrl + c on rubber-banded area', fakeAsync(() => {
        spyOn(shortcutService, 'getShortcutForEvent').and.returnValue({
            action: ViewerShortcutAction.CopyToClipboard,
            key: 'c',
            modifierKeys: [ViewerModifierKey.ctrlKey],
            category: 'viewer_general',
            description: '',
        });

        spyOn(clipboard, 'copy');

        let rubberBandResult: RubberBandPrimitive | undefined;
        (service.rubberBandAreaSelection$ as Subject<RubberBandPrimitive | undefined>).subscribe((data) => {
            rubberBandResult = data;
        });

        service.onResize({ top: 0, left: 0, width: 500, height: 1000 });
        service.initialize(hostData);
        tick(100);

        service.onMouseDown({ offsetX: 5, offsetY: 5, button: 0 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 5, offsetY: 5 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 100, offsetY: 100 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 200, offsetY: 200 } as unknown as MouseEvent);
        tick(100);
        expect(rubberBandResult?.rect).toEqual({ top: 5, left: 5, width: 195, height: 195 });
        service.onMouseUp({ offsetX: 200, offsetY: 200, button: 0 } as unknown as MouseEvent);
        tick(50);

        expect(rubberBandResult).toBeDefined();

        mockViewerKeyboardEvent$.next(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));

        expect(shortcutService.getShortcutForEvent).toHaveBeenCalled();

        expect(clipboard.copy).toHaveBeenCalled();

        flush();
    }));

    it('should not copy text to clipboard on ctrl + c on rubber-banded area', fakeAsync(() => {
        spyOn(shortcutService, 'getShortcutForEvent').and.returnValue({
            action: ViewerShortcutAction.CopyToClipboard,
            key: 'c',
            modifierKeys: [ViewerModifierKey.ctrlKey],
            category: 'viewer_general',
            description: '',
        });

        spyOn(clipboard, 'copy');
        service.setHandleClipboard(false);

        service.onResize({ top: 0, left: 0, width: 500, height: 1000 });
        service.initialize(hostData);
        tick(100);

        service.onMouseDown({ offsetX: 5, offsetY: 5, button: 0 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 5, offsetY: 5 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 100, offsetY: 100 } as unknown as MouseEvent);
        tick(50);
        service.onMouseMove({ offsetX: 200, offsetY: 200 } as unknown as MouseEvent);
        tick(100);
        service.onMouseUp({ offsetX: 200, offsetY: 200, button: 0 } as unknown as MouseEvent);
        tick(50);

        mockViewerKeyboardEvent$.next(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));

        expect(shortcutService.getShortcutForEvent).toHaveBeenCalled();
        expect(clipboard.copy).not.toHaveBeenCalled();

        flush();
    }));

    it('should emit text layout data as string from OCR datasource', async () => {
        service.onResize(currentSizeInfo);
        service.initialize(hostData);

        const layout = await firstValueFrom(service.textLayoutData$);
        expect(layout).toBe(mockTextLayout);
    });
});
