/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ViewerTextOnlyLayerComponent } from './viewer-text-only-layer.component';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerService } from '../services/viewer.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getDefaultStateData, StateData } from '../models/state-data';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { ConfigDefault } from '../models/config-default';

class MockViewerTextLayerService implements Partial<ViewerTextLayerService> {
    initialize = jasmine.createSpy('initialize');
    onResize = jasmine.createSpy('onResize');
    setAutoNavigationToHighlight = jasmine.createSpy('setAutoNavigationToHighlight');
    scaledAllTextData$ = scaledAllTextData$.asObservable();
    scaledActiveHighlights$ = highlightSubject$.asObservable();
    textLayoutData$ = textLayoutData$.asObservable();
}

const scaledAllTextData$ = new Subject<HighlightPrimitive[]>();
const highlightSubject$ = new Subject<HighlightPrimitive[]>();
const textLayoutData$ = new Subject<string>();
const mockHighlightPrimitive = HighlightPrimitive.fromTextData({
    text: 'text',
    top: 10,
    left: 20,
    width: 30,
    height: 40,
    pageId: '1',
    highlightState: 'VALID',
});

describe('ViewerTextOnlyLayerComponent', () => {
    let component: ViewerTextOnlyLayerComponent;
    let fixture: ComponentFixture<ViewerTextOnlyLayerComponent>;
    let viewerTextLayerService: ViewerTextLayerService;
    let mockViewerState$: BehaviorSubject<StateData>;

    const hostData: ViewerLayerHostData = {
        documentId: 'doc1',
        pageId: 'p1',
        contentNaturalWidth: 500,
        contentNaturalHeight: 1000,
    };

    beforeEach(() => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changeViewerState: jasmine.createSpy('changeViewerState'),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () =>
                    of({
                        blobUrl: 'image-blob-url',
                        width: 1000,
                        height: 800,
                    }),
            }),
            viewerConfig: ConfigDefault,
        };
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: ViewerTextLayerService, useClass: MockViewerTextLayerService },
                { provide: ViewerService, useValue: mockViewerService },
            ],
        }).overrideComponent(ViewerTextOnlyLayerComponent, { set: { providers: [] } });

        fixture = TestBed.createComponent(ViewerTextOnlyLayerComponent);
        component = fixture.componentInstance;
        component.host = hostData;
        fixture.detectChanges();

        viewerTextLayerService = TestBed.inject(ViewerTextLayerService);
    });

    afterEach(() => {
        mockViewerState$.complete();
    });

    it('should initialize with host data', () => {
        expect(component.host).toEqual(hostData);
        expect(viewerTextLayerService.initialize).toHaveBeenCalledWith(hostData);
    });

    it('should display text layout when currentLayer is TextOnly', fakeAsync(() => {
        mockViewerState$.next({ ...getDefaultStateData(ConfigDefault), currentLayer: ViewerLayerType.TextOnly });
        highlightSubject$.next([]);
        textLayoutData$.next('sample text');
        tick(200);
        fixture.detectChanges();

        expect(component.containerElement?.nativeElement.innerHTML).toContain('sample text');
    }));

    it('should not emit an empty array to textContent$', fakeAsync(() => {
        const textContentSpy = jasmine.createSpy('textContentSpy');
        component.textContent$.subscribe(textContentSpy);
        highlightSubject$.next([]);

        component.host = hostData;
        tick();
        fixture.detectChanges();

        expect(textContentSpy).not.toHaveBeenCalled();
    }));

    it('should wait for OCR layout data and not display anything until it arrives for the current page', fakeAsync(() => {
        const newPageId = 'p2';
        component.host = { ...hostData, pageId: newPageId };
        component.ngAfterViewInit();
        highlightSubject$.next([mockHighlightPrimitive]);

        tick(100);
        fixture.detectChanges();

        let textContent = '';
        component.textContent$.subscribe((data) => {
            textContent = data ? data.text : '';
        });

        expect(textContent).toBe('');

        textLayoutData$.next('test layout data');
        tick(100);
        fixture.detectChanges();

        expect(textContent).toBe('test layout data');
    }));

    it('should not display line number #001', fakeAsync(() => {
        const newPageId = 'p2';
        component.host = { ...hostData, pageId: newPageId };
        component.ngAfterViewInit();
        highlightSubject$.next([mockHighlightPrimitive]);

        tick(100);
        fixture.detectChanges();

        let textContent = '';
        component.textContent$.subscribe((data) => {
            textContent = data ? data.text : '';
        });

        expect(textContent).toBe('');

        textLayoutData$.next('#001 text layout data');

        tick(100);
        fixture.detectChanges();

        expect(textContent.trim()).toBe('text layout data');
    }));

    it('should highlight the active text', fakeAsync(() => {
        const newPageId = 'p2';
        component.host = { ...hostData, pageId: newPageId };
        component.ngAfterViewInit();

        tick(100);
        fixture.detectChanges();

        let textContent = '';
        component.textContent$.subscribe((data) => {
            textContent = data ? data.text : '';
        });

        expect(textContent).toBe('');

        textLayoutData$.next('#001 text layout data');
        highlightSubject$.next([mockHighlightPrimitive]);

        tick(100);
        fixture.detectChanges();

        expect(textContent.trim()).toBe('<span class="idp-layout-background-text__valid">text</span> layout data');
    }));
});
