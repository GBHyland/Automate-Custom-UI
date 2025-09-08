/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ViewerTextLayerComponent, TooltipInfo } from './viewer-text-layer.component';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerService } from '../services/viewer.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { of, Subject } from 'rxjs';
import { StateData } from '../models/state-data';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { RubberBandPrimitive } from '../models/text-layer/rubber-band-primitive';
import { By } from '@angular/platform-browser';
import { NgZone } from '@angular/core';
import { ViewerTextHighlightData } from '../models/text-layer/ocr-candidate';

class MockViewerService implements Partial<ViewerService> {
    datasource$ = of({
        documents: [
            {
                id: 'doc1',
                name: 'document 1',
                pages: [
                    { id: 'p1', name: 'page 1', isSelected: true, rotation: 90 },
                    { id: 'p2', name: 'page 2', isSelected: false, rotation: 90 },
                ],
            },
        ],
        loadImageFn: () => ({ width: 800, height: 600, blobUrl: '', viewerRotation: 0, skew: 0 }),
        loadThumbnailFn: () => '',
        loadPageOcrFn: () => [],
    });

    viewerState$ = of({ rotationStep: 90, currentZoomLevel: 100 } as unknown as StateData);
}

class MockViewerLayerService implements Partial<ViewerLayerService> {
    registerLayer = jasmine.createSpy('registerLayer');
    unregisterLayer = jasmine.createSpy('unregisterLayer');
    getLayers() {
        return [{ type: ViewerLayerType.TextSuperImposed, order: 2 }];
    }
}

class MockResizeObserverService implements Partial<ResizeObserverService> {
    observe = jasmine.createSpy('observe').and.returnValue(of({} as unknown as ResizeObserverEntry));
    unobserve = jasmine.createSpy('unobserve');
}

class MockViewerTextLayerService implements Partial<ViewerTextLayerService> {
    initialize = jasmine.createSpy('initialize');
    onResize = jasmine.createSpy('onResize');
    onMouseMove = jasmine.createSpy('onMouseMove');
    onMouseDown = jasmine.createSpy('onMouseDown');
    onMouseUp = jasmine.createSpy('onMouseUp');
    onMouseClick = jasmine.createSpy('onMouseClick');
    onMouseLeave = jasmine.createSpy('onMouseLeave');
    setAutoNavigationToHighlight = jasmine.createSpy('setAutoNavigationToHighlight');
    setHandleClipboard = jasmine.createSpy('setHandleClipboard');
    tooltip$ = tooltipSubject$.asObservable();
    scaledActiveHighlights$ = highlightSubject$.asObservable();
    rubberBandAreaSelection$ = rubberBandSubject$.asObservable();
    textSelection$ = textSelectionSubject$.asObservable();
}

const tooltipSubject$ = new Subject<TooltipInfo[]>();
const mockTooltip: TooltipInfo = { text: 'tooltip', top: 10, left: 20, width: 30, height: 40, rotation: -0, scale: 1 };

const highlightSubject$ = new Subject<HighlightPrimitive[]>();
const mockHighlightPrimitive = HighlightPrimitive.fromTextData({
    text: 'text',
    top: 10,
    left: 20,
    width: 30,
    height: 40,
    pageId: '1',
});

const rubberBandSubject$ = new Subject<RubberBandPrimitive>();
const mockRubberBandPrimitive = RubberBandPrimitive.newInstance(20, 10, 30, 40, 1);
mockRubberBandPrimitive.setText('text', '1');

const textSelectionSubject$ = new Subject<ViewerTextHighlightData>();
const mockTextSelection: ViewerTextHighlightData = {
    text: 'text',
    pageId: '1',
    rect: {
        actual: { top: 10, left: 20, width: 30, height: 40 },
        scaled: { top: 10, left: 20, width: 30, height: 40 },
        scale: 1,
    },
};

describe('ViewerTextLayerComponent', () => {
    let component: ViewerTextLayerComponent;
    let fixture: ComponentFixture<ViewerTextLayerComponent>;
    let viewerTextLayerService: ViewerTextLayerService;
    let resizeObserverService: ResizeObserverService;

    const hostData: ViewerLayerHostData = {
        documentId: 'doc1',
        pageId: 'p1',
        contentNaturalWidth: 500,
        contentNaturalHeight: 1000,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: ViewerTextLayerService, useClass: MockViewerTextLayerService },
                { provide: ResizeObserverService, useClass: MockResizeObserverService },
                { provide: ViewerLayerService, useClass: MockViewerLayerService },
                { provide: ViewerService, useClass: MockViewerService },
            ],
        })
            .overrideComponent(ViewerTextLayerComponent, { set: { providers: [] } })
            .compileComponents();

        fixture = TestBed.createComponent(ViewerTextLayerComponent);
        component = fixture.componentInstance;
        component.host = hostData;
        component.canvasElement = { nativeElement: document.createElement('canvas') };
        fixture.detectChanges();

        viewerTextLayerService = TestBed.inject(ViewerTextLayerService);
        resizeObserverService = TestBed.inject(ResizeObserverService);

        const ngZone = TestBed.inject(NgZone);
        spyOn(ngZone, 'runOutsideAngular').and.callFake((fn) => fn());
        spyOn(ngZone, 'run').and.callFake((fn) => fn());
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should initialize with host', () => {
        expect(viewerTextLayerService.initialize).toHaveBeenCalledWith(hostData);
        expect(resizeObserverService.observe).toHaveBeenCalled();
    });

    it('should handle mouse events', () => {
        const event = new MouseEvent('click');

        component.onMouseMove(event);
        component.onMouseDown(event);
        component.onMouseUp(event);
        component.onMouseClick(event);
        component.onMouseLeave(event);

        expect(viewerTextLayerService.onMouseMove).toHaveBeenCalledWith(event);
        expect(viewerTextLayerService.onMouseDown).toHaveBeenCalledWith(event);
        expect(viewerTextLayerService.onMouseUp).toHaveBeenCalledWith(event);
        expect(viewerTextLayerService.onMouseClick).toHaveBeenCalledWith(event);
        expect(viewerTextLayerService.onMouseLeave).toHaveBeenCalledWith(event);
    });

    it('should unobserve on destroy', () => {
        component.ngOnDestroy();
        expect(resizeObserverService.unobserve).toHaveBeenCalled();
    });

    it('should handle resize when valid size info emits', () => {
        const sizeChange = {
            contentRect: { width: 100, height: 200 },
        } as unknown as ResizeObserverEntry;

        (resizeObserverService.observe as jasmine.Spy).and.returnValue(of(sizeChange));

        component.ngAfterViewInit();

        expect(component.canvasWidth).toBe(100);
        expect(component.canvasHeight).toBe(200);
        expect(viewerTextLayerService.onResize).toHaveBeenCalledWith({
            width: 100,
            height: 200,
            top: 0,
            left: 0,
        });
    });

    it('should not resize when invalid size info emits', () => {
        const sizeChange = {
            contentRect: { width: 0, height: 100 },
        } as unknown as ResizeObserverEntry;

        (resizeObserverService.observe as jasmine.Spy).and.returnValue(of(sizeChange));

        component.ngAfterViewInit();

        expect(component.canvasWidth).toBe(0);
        expect(component.canvasHeight).toBe(0);
        expect(viewerTextLayerService.onResize).not.toHaveBeenCalled();
    });

    it('should handle tooltip', (done) => {
        component.toolTips$.subscribe((data) => {
            expect(data).toEqual([mockTooltip]);
            fixture.detectChanges();
            const tooltipElement = fixture.debugElement.query(By.css('.idp-viewer-text-layer__text-tooltip'));
            expect(tooltipElement.nativeElement.textContent).toContain(mockTooltip.text);
            done();
        });

        tooltipSubject$.next([mockTooltip]);
    });

    it('should handle highlights', fakeAsync(() => {
        const highlightOutputSpy = spyOn(component.activeHighlightInfoChange, 'emit');
        const highlightDrawSpy = spyOn(mockHighlightPrimitive, 'draw');

        const sizeChange = {
            contentRect: { width: 100, height: 200 },
        } as unknown as ResizeObserverEntry;
        (resizeObserverService.observe as jasmine.Spy).and.returnValue(of(sizeChange));
        component.ngAfterViewInit();

        highlightSubject$.next([mockHighlightPrimitive]);

        tick(100);

        expect(highlightOutputSpy).toHaveBeenCalledWith({
            highlights: [mockHighlightPrimitive.toTextHighlightData()],
            rotation: 90,
        });
        expect(highlightDrawSpy).toHaveBeenCalled();
    }));

    it('should handle rubber band', fakeAsync(() => {
        const rubberBandDrawSpy = spyOn(mockRubberBandPrimitive, 'draw');
        rubberBandSubject$.next(mockRubberBandPrimitive);

        tick(100);

        expect(rubberBandDrawSpy).toHaveBeenCalled();
    }));

    it('should handle text selection', fakeAsync(() => {
        const textSelectionOutputSpy = spyOn(component.textSelected, 'emit');
        textSelectionSubject$.next(mockTextSelection);

        tick(100);

        expect(textSelectionOutputSpy).toHaveBeenCalledWith(mockTextSelection);
    }));

    it('should handle autoNavigationToHighlight input change', () => {
        component.autoNavigationToHighlight = true;
        expect(viewerTextLayerService.setAutoNavigationToHighlight).toHaveBeenCalledWith(true);

        component.autoNavigationToHighlight = false;
        expect(viewerTextLayerService.setAutoNavigationToHighlight).toHaveBeenCalledWith(false);
    });

    it('should handle handleClipboard input change', () => {
        component.handleClipboard = true;
        expect(viewerTextLayerService.setHandleClipboard).toHaveBeenCalledWith(true);

        component.handleClipboard = false;
        expect(viewerTextLayerService.setHandleClipboard).toHaveBeenCalledWith(false);
    });
});
