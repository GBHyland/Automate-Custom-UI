/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopTranslateModule, NotificationService } from '@alfresco/adf-core';
import { ImageLayerComponent } from './image-layer.component';
import { ViewerService } from '../services/viewer.service';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { BehaviorSubject, firstValueFrom, Observable, of, Subject } from 'rxjs';
import { Layout, LayoutDirection, LayoutType, UserLayoutOptionConfig, UserLayoutOptions } from '../models/layout';
import { getDefaultStateData, StateData } from '../models/state-data';
import { ConfigDefault } from '../models/config-default';
import { EventTypes, ViewerEvent } from '../models/events';
import { ImageData } from '../models/datasource';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { ViewerLayerType } from '../models/viewer-layer';
import { By } from '@angular/platform-browser';

describe('ImageLayerComponent', () => {
    let component: ImageLayerComponent;
    let fixture: ComponentFixture<ImageLayerComponent>;
    let totalPagesCount$: Subject<number>;
    let mockViewerState$: BehaviorSubject<StateData>;
    let mockLayout$: BehaviorSubject<Layout>;
    let mockViewerEvent$: BehaviorSubject<ViewerEvent<object>>;
    let mockImageData$: BehaviorSubject<ImageData>;
    let viewerLayerService: ViewerLayerService;

    const mockScrollDispatcher = {
        scrolled: () => of(),
    };

    const mockNotificationService = {
        showInfo: () => {},
    };

    const mockImageData: ImageData = {
        blobUrl: 'image-blob-url',
        width: 1000,
        height: 800,
        correctionAngle: 0,
        viewerRotation: 0,
        skew: 0,
    };

    const layout = UserLayoutOptionConfig[UserLayoutOptions.Single_Vertical].layout;

    beforeEach(() => {
        totalPagesCount$ = new Subject<number>();
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));
        mockLayout$ = new BehaviorSubject<Layout>(layout);
        mockImageData$ = new BehaviorSubject<ImageData>(mockImageData);
        mockViewerEvent$ = new BehaviorSubject<ViewerEvent<object>>({
            type: EventTypes.ZoomChanged,
            timestamp: Date.now().toString(),
            data: {
                oldValue: { currentZoomLevel: 100 },
                newValue: { currentZoomLevel: 125 },
                dataSourceRef: [
                    {
                        documentId: '596a9d10-96eb-4fd1-a8e2-f37d3099da6e',
                        pageId: '9d84a0e7-c317-4eba-86e8-329e764524c9__0',
                    },
                ],
            },
        });

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            viewerLayout$: mockLayout$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            changeViewerState: jasmine.createSpy('changeViewerState'),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageData$.asObservable(),
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
            viewerConfig: ConfigDefault,
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                { provide: ViewerService, useValue: mockViewerService },
                { provide: ScrollDispatcher, useValue: mockScrollDispatcher },
                { provide: NotificationService, useValue: mockNotificationService },
                ViewerLayerService,
            ],
        });

        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        viewerLayerService = TestBed.inject(ViewerLayerService);
    });

    afterEach(() => {
        totalPagesCount$.complete();
        mockViewerState$.complete();
        mockImageData$.complete();
        mockViewerEvent$.complete();
        mockLayout$.complete();
        fixture.destroy();
    });

    it('should initialize displayImages$ observable', async () => {
        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            viewerLayout$: mockLayout$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [],
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
            viewerConfig: ConfigDefault,
        };
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await firstValueFrom(component.displayImages$).then((images) => {
            expect(images).toEqual([]);
        });
    });

    it('should not have default text layer to TextOnly', async () => {
        const isTextOnly = await firstValueFrom(component.isTextOnly$);
        expect(isTextOnly).toBe(false);
    });

    it('should initialize viewerLayout$ observable with default layout', async () => {
        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.type).toEqual(LayoutType.SingleScrollable);
        });
    });

    it('should show empty view when totalPageCount$ is 0', async () => {
        totalPagesCount$.next(0);
        fixture.detectChanges();
        await fixture.whenStable();
        const emptyView = fixture.nativeElement.querySelector('hyland-idp-viewer-empty');
        expect(emptyView).toBeTruthy();
    });

    it('should show single scrollable view when totalPageCount$ is greater than 0', async () => {
        totalPagesCount$.next(1);
        fixture.detectChanges();
        await fixture.whenStable();
        const scrollableView = fixture.nativeElement.querySelector('hyland-idp-viewer-scrollable-view');
        expect(scrollableView).toBeTruthy();
    });

    it('should handle datasource.loadImageFn returning an observable', async () => {
        const mockImageDataLocal$ = of({
            blobUrl: 'image-url',
            width: 1000,
            height: 800,
        });
        const mockViewerService = {
            viewerLayout$: mockLayout$.asObservable(),
            viewerState$: mockViewerState$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageDataLocal$,
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
        };
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        await firstValueFrom(component.displayImages$).then((images) => {
            expect(images.length).toBe(1);
            expect(images[0].image$ instanceof Observable).toBeTrue();
            expect(
                images[0].image$.subscribe((imageData) => {
                    expect(imageData.blobUrl).toBe('image-url');
                    expect(imageData.width).toBe(1000);
                    expect(imageData.height).toBe(800);
                })
            );
        });
    });

    it('should handle datasource.loadImageFn returning a promise', async () => {
        const mockImageDataPromise = Promise.resolve({
            blobUrl: 'image-blob-url',
            width: 1000,
            height: 1000,
        });
        const mockViewerService = {
            viewerLayout$: mockLayout$.asObservable(),
            viewerState$: mockViewerState$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageDataPromise,
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        await firstValueFrom(component.displayImages$).then(async (images) => {
            await firstValueFrom(images[0].image$).then((imageData) => {
                expect(imageData.blobUrl).toBe('image-blob-url');
                expect(imageData.width).toBe(1000);
                expect(imageData.height).toBe(1000);
            });
        });
    });

    it('should handle datasource.loadImageFn returning a plain object', async () => {
        const mockImageDataLocal = {
            blobUrl: 'image-blob-url',
            width: 1000,
            height: 1000,
        };
        const mockViewerService = {
            viewerLayout$: mockLayout$.asObservable(),
            viewerState$: mockViewerState$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageDataLocal,
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await firstValueFrom(component.displayImages$).then(async (images) => {
            await firstValueFrom(images[0].image$).then((imageData: any) => {
                expect(imageData.blobUrl).toBe('image-blob-url');
                expect(imageData.width).toBe(1000);
                expect(imageData.height).toBe(1000);
            });
        });
    });

    it('should call viewerService.changeViewerState on image load', () => {
        const mockViewerService = TestBed.inject(ViewerService);
        const documentId = 'doc1';
        const pageId = 'page1';
        component.onImageLoaded(documentId, pageId);

        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith(
            { currentDocumentId: documentId, currentPageId: pageId },
            EventTypes.ImageLoaded
        );
    });

    it('should update viewerLayout$ observable when layout changes', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.Grid,
            columns: 3,
            rows: 2,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.type).toEqual(LayoutType.Grid);
            expect(viewerLayout.columnWidthPercent).toBeCloseTo(33.33, 1);
            expect(viewerLayout.rowHeightPercent).toBe(45);
        });
    });

    it('should update viewerLayout$ observable when zoom level changes', async () => {
        const newState = {
            ...getDefaultStateData(ConfigDefault),
            currentZoomLevel: 150,
        };
        mockViewerState$.next(newState);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.currentScaleFactor).toBe(1.5);
        });
    });

    it('should update viewerLayout$ observable when layout direction changes', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.SingleScrollable,
            layoutDirection: LayoutDirection.Horizontal,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.scrollDirection).toEqual(LayoutDirection.Horizontal);
        });
    });

    it('should update viewerLayout$ observable when layout type changes', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.SinglePage,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.type).toEqual(LayoutType.SinglePage);
        });
    });

    it('should update viewerLayout$ observable when layout columns change', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.Grid,
            columns: 4,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.columnWidthPercent).toBe(25);
        });
    });

    it('should update viewerLayout$ observable when layout rows change', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.Grid,
            rows: 3,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.viewerLayout$).then((viewerLayout) => {
            expect(viewerLayout.rowHeightPercent).toBeCloseTo(33.33, 1);
        });
    });

    it('should update displayImages$ observable when currentPageIndex is provided', async () => {
        const newState = {
            ...getDefaultStateData(ConfigDefault),
            currentZoomLevel: 150,
            pageNavInfo: { currentPageIndex: 1, totalPages: 3 },
        };
        mockViewerState$.next(newState);

        await firstValueFrom(component.displayImages$).then((images) => {
            expect(images.length).toBe(1);
        });
    });

    it('should update displayImages$ observable when bestFit is true', async () => {
        const newState = {
            ...getDefaultStateData(ConfigDefault),
            bestFit: true,
        };

        const mockViewerService = {
            viewerLayout$: mockLayout$.asObservable(),
            viewerState$: mockViewerState$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageData$,
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
        };
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockViewerState$.next(newState);

        await firstValueFrom(component.displayImages$).then(async (images) => {
            expect(images.length).toBe(1);
            await firstValueFrom(images[0].image$).then((imageData) => {
                expect(imageData.width).toBe(1000);
                expect(imageData.height).toBe(800);
            });
        });
    });

    it('should update displayImages$ observable when bestFit is false', async () => {
        const newState = {
            ...getDefaultStateData(ConfigDefault),
            bestFit: false,
        };

        const mockViewerService = {
            viewerLayout$: mockLayout$.asObservable(),
            viewerState$: mockViewerState$.asObservable(),
            viewerEvent$: mockViewerEvent$.asObservable(),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () => mockImageData$,
            }),
            totalPageCount$: totalPagesCount$.asObservable(),
        };
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerLayerService],
        });
        fixture = TestBed.createComponent(ImageLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockViewerState$.next(newState);

        await firstValueFrom(component.displayImages$).then(async (images) => {
            expect(images.length).toBe(1);
            await firstValueFrom(images[0].image$).then((imageData) => {
                expect(imageData.width).toBe(1000);
                expect(imageData.height).toBe(800);
            });
        });
    });

    it('should register viewer layer on init', () => {
        expect(viewerLayerService.getLayers().length).toEqual(1);
        expect(viewerLayerService.getLayers()[0].type).toEqual(ViewerLayerType.Image);
    });

    it('should unregister viewer layer on destroy', () => {
        expect(viewerLayerService.getLayers().length).toEqual(1);
        component.ngOnDestroy();
        expect(viewerLayerService.getLayers().length).toEqual(0);
    });

    it('should emit layers data properly', async () => {
        viewerLayerService.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        await firstValueFrom(component.viewerLayers$).then((layers) => {
            expect(layers.length).toEqual(1);
            expect(layers[0].type).toEqual(ViewerLayerType.TextSuperImposed);
        });
    });

    it('should not have layers when layout type is not Single Page', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.Grid,
        };
        viewerLayerService.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        mockLayout$.next(newLayout);
        fixture.detectChanges();

        await fixture.whenStable();
        const textOnlyLayer = fixture.debugElement.query(By.css(`.idp-viewer-content-layer__${ViewerLayerType.TextOnly.toLowerCase()}`));
        expect(textOnlyLayer).toBeNull();

        const textSuperImposedLayer = fixture.debugElement.query(
            By.css(`.idp-viewer-content-layer__${ViewerLayerType.TextSuperImposed.toLowerCase()}`)
        );
        expect(textSuperImposedLayer).toBeNull();
    });

    it('should update displayImages$ observable when rotationStep changes', async () => {
        const newState = {
            ...getDefaultStateData(ConfigDefault),
            rotationStep: 90,
        };
        mockViewerState$.next(newState);

        await firstValueFrom(component.displayImages$).then(async (images) => {
            expect(images.length).toBe(1);
            await firstValueFrom(images[0].image$).then((imageData) => {
                expect(imageData).not.toBeNull();
            });
        });
    });

    it('should update displayImages$ observable when layout type changes', async () => {
        const newLayout = {
            ...layout,
            type: LayoutType.Grid,
        };
        mockLayout$.next(newLayout);

        await firstValueFrom(component.displayImages$).then(async (images) => {
            expect(images.length).toBe(1);
            await firstValueFrom(images[0].image$).then((imageData) => {
                expect(imageData).not.toBeNull();
            });
        });
    });

    it('should update isTextOnly$ observable when viewer state changes to TextOnly', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentLayer: ViewerLayerType.TextOnly,
        });

        component.isTextOnly$.subscribe((isTextOnly) => {
            expect(isTextOnly).toBe(true);
        });
    });

    it('should update isTextOnly$ observable when viewer state changes to non-TextOnly', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentLayer: ViewerLayerType.Image,
        });

        component.isTextOnly$.subscribe((isTextOnly) => {
            expect(isTextOnly).toBe(false);
        });
    });
});
