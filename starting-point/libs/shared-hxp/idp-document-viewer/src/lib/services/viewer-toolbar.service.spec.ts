/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule, NoopTranslationService } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { ViewerToolbarService } from './viewer-toolbar.service';
import { ViewerService } from './viewer.service';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { ConfigDefault } from '../models/config-default';
import { ToolbarItemTypes } from '../models/toolbar';
import { LayoutDirection, LayoutType, UserLayoutOptions } from '../models/layout';
import { StateData } from '../models/state-data';
import { ViewerShortcutAction, ViewerShortcutService } from './viewer-shortcut.service';
import { ViewerLayerType } from '../models/viewer-layer';

describe('ViewerToolbarService', () => {
    let service: ViewerToolbarService;
    let shortcutService: ViewerShortcutService;
    let mockViewerState$: BehaviorSubject<Partial<StateData>>;
    let mockViewerKeyboardEvent$: BehaviorSubject<Partial<KeyboardEvent>>;

    beforeEach(() => {
        mockViewerState$ = new BehaviorSubject<Partial<StateData>>({
            currentLayout: { type: UserLayoutOptions.Single_Vertical },
            defaultZoomConfig: { min: 25, max: 300, step: 25 },
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
            selectedToolbarItems: [ToolbarItemTypes.LayoutChange],
        });

        mockViewerKeyboardEvent$ = new BehaviorSubject<Partial<KeyboardEvent>>({
            key: 'L',
            code: 'KeyL',
        });

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                NoopTranslationService,
                ViewerService,
                ViewerToolbarService,
                ViewerShortcutService,
                {
                    provide: ViewerService,
                    useValue: {
                        viewerLayout$: of({
                            type: LayoutType.SingleScrollable,
                            columns: 1,
                            rows: 1,
                            layoutDirection: LayoutDirection.Vertical,
                            availableActions: [
                                ToolbarItemTypes.Zoom,
                                ToolbarItemTypes.Rotate,
                                ToolbarItemTypes.LayoutChange,
                                ToolbarItemTypes.FullScreen,
                                ToolbarItemTypes.PageNavigation,
                                ToolbarItemTypes.BestFit,
                            ],
                        }),
                        viewerState$: mockViewerState$.asObservable(),
                        changeViewerState: jasmine.createSpy(),
                        changeUserSelectedLayout: jasmine.createSpy(),
                        viewerConfig: ConfigDefault,
                        viewerKeyboardEvent$: mockViewerKeyboardEvent$.asObservable(),
                    },
                },
            ],
        });
        service = TestBed.inject(ViewerToolbarService);
        shortcutService = TestBed.inject(ViewerShortcutService);
    });

    afterEach(() => {
        mockViewerState$.complete();
    });

    it('should initialize viewerToolbarItems$', (done) => {
        service.viewerToolbarItems$.subscribe((items) => {
            expect(items.length).toBeGreaterThan(0);
            done();
        });
    });

    it('should update toolbar items of LayoutChange based on viewer state', (done) => {
        service.viewerToolbarItems$.subscribe((items) => {
            const layoutChangeItem = items.find((item) => item.type === ToolbarItemTypes.LayoutChange);
            expect(layoutChangeItem).toBeTruthy();
            expect(layoutChangeItem?.enabled).toBeTrue();
            const subItems = layoutChangeItem?.subItems as { [key: string]: { enabled: boolean } };
            const gridSubItem = subItems['grid'];
            const verticalScrollingSubItem = subItems['vertical_scrolling'];
            const horizontalScrollingSubItem = subItems['horizontal_scrolling'];
            expect(gridSubItem?.enabled).toBeTrue();
            expect(verticalScrollingSubItem?.enabled).toBeTrue();
            expect(horizontalScrollingSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should enable/disable subItems of Zoom based on state', (done) => {
        service.viewerToolbarItems$.subscribe((items) => {
            const zoomItem = items.find((item) => item.type === ToolbarItemTypes.Zoom);
            expect(zoomItem).toBeTruthy();
            const subItems = zoomItem?.subItems as { [key: string]: { enabled: boolean } };
            const zoomInSubItem = subItems['zoom_in'];
            const zoomOutSubItem = subItems['zoom_out'];
            expect(zoomInSubItem?.enabled).toBeTrue();
            expect(zoomOutSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should enable Rotate and Fullscreen based on state', (done) => {
        service.viewerToolbarItems$.subscribe((items) => {
            const rotateItem = items.find((item) => item.type === ToolbarItemTypes.Rotate);
            expect(rotateItem).toBeTruthy();
            expect(rotateItem?.enabled).toBeTrue();

            const fullScreenItem = items.find((item) => item.type === ToolbarItemTypes.FullScreen);
            expect(fullScreenItem).toBeTruthy();
            expect(fullScreenItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should select BestFit toolbar item when bestFit is true', (done) => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
            selectedToolbarItems: [ToolbarItemTypes.BestFit],
            bestFit: true,
        });
        service = TestBed.inject(ViewerToolbarService);

        service.viewerToolbarItems$.subscribe((items) => {
            const bestFitItem = items.find((item) => item.type === ToolbarItemTypes.BestFit);
            expect(bestFitItem).toBeTruthy();
            expect(bestFitItem?.selected).toBeTrue();
            done();
        });
    });

    it('should not select BestFit toolbar item when bestFit is false', (done) => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
            selectedToolbarItems: [],
            bestFit: false,
        });
        service = TestBed.inject(ViewerToolbarService);

        service.viewerToolbarItems$.subscribe((items) => {
            const bestFitItem = items.find((item) => item.type === ToolbarItemTypes.BestFit);
            expect(bestFitItem).toBeTruthy();
            expect(bestFitItem?.selected).toBeFalse();
            done();
        });
    });

    it('should not select LayoutChange toolbar item when bestFit is true', () => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
            selectedToolbarItems: [ToolbarItemTypes.BestFit],
            bestFit: true,
        });
        service = TestBed.inject(ViewerToolbarService);

        service.viewerToolbarItems$.subscribe((items) => {
            const layoutChangeItem = items.find((item) => item.type === ToolbarItemTypes.LayoutChange);
            expect(layoutChangeItem).toBeTruthy();
            expect(layoutChangeItem?.selected).toBeFalse();
        });
    });

    it('should select text only layer', () => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentLayer: ViewerLayerType.TextOnly,
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
        });
        service = TestBed.inject(ViewerToolbarService);

        service.viewerToolbarItems$.subscribe((items) => {
            const layerSelectionItem = items.find((item) => item.type === ToolbarItemTypes.LayerSelection);
            expect(layerSelectionItem).toBeTruthy();
            const subItemsTextLayer = layerSelectionItem?.subItems as { [key: string]: { id: string; selected: boolean } };
            expect(subItemsTextLayer['image'].id).toBe('image');
            expect(subItemsTextLayer['image'].selected).toBeFalsy();
            expect(subItemsTextLayer['text'].id).toBe('text');
            expect(subItemsTextLayer['text'].selected).toBeTruthy();
        });
    });

    it('should select image layer', () => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentLayer: ViewerLayerType.Image,
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
        });
        service = TestBed.inject(ViewerToolbarService);

        service.viewerToolbarItems$.subscribe((items) => {
            const layerSelectionItem = items.find((item) => item.type === ToolbarItemTypes.LayerSelection);
            expect(layerSelectionItem).toBeTruthy();
            const subItemsTextLayer = layerSelectionItem?.subItems as { [key: string]: { id: string; selected: boolean } };
            expect(subItemsTextLayer['image'].id).toBe('image');
            expect(subItemsTextLayer['image'].selected).toBeTruthy();
            expect(subItemsTextLayer['text'].id).toBe('text');
            expect(subItemsTextLayer['text'].selected).toBeFalsy();
        });
    });

    it('should handle text layer change shortcut action', async () => {
        const event = new KeyboardEvent('keydown', { key: 'W' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.Text,
            toolbarItemType: ToolbarItemTypes.LayerSelection,
        });

        mockViewerKeyboardEvent$.next(event);

        await firstValueFrom(service.viewerToolbarItems$).then((items) => {
            const layerSelectionItem = items.find((item) => item.type === ToolbarItemTypes.LayerSelection);
            expect(layerSelectionItem).toBeTruthy();
            const subItems = layerSelectionItem?.subItems as { [key: string]: { enabled: boolean; shortcutKey: string } };
            const textSubItem = subItems['text'];
            expect(textSubItem?.enabled).toBeTrue();
            expect(textSubItem.shortcutKey).toBe('(SHIFT + W)');
        });
    });

    it('should handle image layer change shortcut action', async () => {
        const event = new KeyboardEvent('keydown', { key: 'I' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.Image,
            toolbarItemType: ToolbarItemTypes.LayerSelection,
        });

        mockViewerKeyboardEvent$.next(event);

        await firstValueFrom(service.viewerToolbarItems$).then((items) => {
            const layerSelectionItem = items.find((item) => item.type === ToolbarItemTypes.LayerSelection);
            expect(layerSelectionItem).toBeTruthy();
            const subItems = layerSelectionItem?.subItems as { [key: string]: { enabled: boolean; shortcutKey: string } };
            const imageSubItem = subItems['image'];
            expect(imageSubItem?.enabled).toBeTrue();
            expect(imageSubItem.shortcutKey).toBe('(SHIFT + I)');
        });
    });

    it('should handle LayoutChange shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'L' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.LayoutChange,
            toolbarItemType: ToolbarItemTypes.LayoutChange,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const layoutChangeItem = items.find((item) => item.type === ToolbarItemTypes.LayoutChange);
            expect(layoutChangeItem).toBeTruthy();
            expect(layoutChangeItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle ZoomIn shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: '+' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.ZoomIn,
            toolbarItemType: ToolbarItemTypes.Zoom,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const zoomItem = items.find((item) => item.type === ToolbarItemTypes.Zoom);
            expect(zoomItem).toBeTruthy();
            const subItems = zoomItem?.subItems as { [key: string]: { enabled: boolean } };
            const zoomInSubItem = subItems['zoom_in'];
            expect(zoomInSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle ZoomOut shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: '-' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.ZoomOut,
            toolbarItemType: ToolbarItemTypes.Zoom,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const zoomItem = items.find((item) => item.type === ToolbarItemTypes.Zoom);
            expect(zoomItem).toBeTruthy();
            const subItems = zoomItem?.subItems as { [key: string]: { enabled: boolean } };
            const zoomOutSubItem = subItems['zoom_out'];
            expect(zoomOutSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle Rotate shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'R' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.Rotate,
            toolbarItemType: ToolbarItemTypes.Rotate,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const rotateItem = items.find((item) => item.type === ToolbarItemTypes.Rotate);
            expect(rotateItem).toBeTruthy();
            expect(rotateItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle FullScreen shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'F' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.FullScreen,
            toolbarItemType: ToolbarItemTypes.FullScreen,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const fullScreenItem = items.find((item) => item.type === ToolbarItemTypes.FullScreen);
            expect(fullScreenItem).toBeTruthy();
            expect(fullScreenItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle BestFit shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'B' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.BestFit,
            toolbarItemType: ToolbarItemTypes.BestFit,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const bestFitItem = items.find((item) => item.type === ToolbarItemTypes.BestFit);
            expect(bestFitItem).toBeTruthy();
            expect(bestFitItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle NavigateNextPage shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            toolbarItemType: ToolbarItemTypes.PageNavigation,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const pageNavItem = items.find((item) => item.type === ToolbarItemTypes.PageNavigation);
            expect(pageNavItem).toBeTruthy();
            const subItems = pageNavItem?.subItems as { [key: string]: { enabled: boolean } };
            const nextPageSubItem = subItems['next'];
            expect(nextPageSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should handle NavigatePreviousPage shortcut action', (done) => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        shortcutService.getShortcutForEvent = jasmine.createSpy().and.returnValue({
            action: ViewerShortcutAction.NavigatePreviousPage,
            toolbarItemType: ToolbarItemTypes.PageNavigation,
        });

        mockViewerKeyboardEvent$.next(event);

        service.viewerToolbarItems$.subscribe((items) => {
            const pageNavItem = items.find((item) => item.type === ToolbarItemTypes.PageNavigation);
            expect(pageNavItem).toBeTruthy();
            const subItems = pageNavItem?.subItems as { [key: string]: { enabled: boolean } };
            const prevPageSubItem = subItems['previous'];
            expect(prevPageSubItem?.enabled).toBeTrue();
            done();
        });
    });

    it('should disable Rotate button when text only mode is selected', async () => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentLayer: ViewerLayerType.TextOnly,
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
        });
        service = TestBed.inject(ViewerToolbarService);

        await firstValueFrom(service.viewerToolbarItems$).then((items) => {
            const rotateItem = items.find((item) => item.type === ToolbarItemTypes.Rotate);
            expect(rotateItem).toBeTruthy();
            expect(rotateItem?.enabled).toBeFalse();
        });
    });

    it('should enable Rotate button when image mode is selected', async () => {
        mockViewerState$.next({
            currentLayout: { type: UserLayoutOptions.SinglePage },
            currentLayer: ViewerLayerType.Image,
            currentZoomLevel: 100,
            pageNavInfo: { currentPageIndex: 1, totalPages: 5 },
        });
        service = TestBed.inject(ViewerToolbarService);

        await firstValueFrom(service.viewerToolbarItems$).then((items) => {
            const rotateItem = items.find((item) => item.type === ToolbarItemTypes.Rotate);
            expect(rotateItem).toBeTruthy();
            expect(rotateItem?.enabled).toBeTrue();
        });
    });
});
