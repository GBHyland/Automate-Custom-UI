/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ToolbarComponent } from './toolbar.component';
import { ViewerService } from '../services/viewer.service';
import { Layout, UserLayoutOptionConfig, UserLayoutOptions } from '../models/layout';
import { ViewerToolbarService } from '../services/viewer-toolbar.service';
import { ToolbarItemTypes } from '../models/toolbar';
import { getDefaultStateData, StateData } from '../models/state-data';
import { BehaviorSubject, of } from 'rxjs';
import { ConfigDefault } from '../models/config-default';
import { ToolbarPosition } from '../models/config-options';
import { Datasource } from '../models/datasource';

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;
    let mockViewerState$: BehaviorSubject<StateData>;
    let mockLayout$: BehaviorSubject<Layout>;
    let mockDatasource$: BehaviorSubject<Datasource>;

    beforeEach(() => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));
        const layout = UserLayoutOptionConfig[UserLayoutOptions.Single_Vertical].layout;
        mockLayout$ = new BehaviorSubject<Layout>(layout);
        mockDatasource$ = new BehaviorSubject<Datasource>({
            documents: [],
            loadImageFn: () =>
                of({
                    blobUrl: 'image-src',
                    width: 100,
                    height: 100,
                    rotation: 0,
                    skew: 0,
                }),
            loadThumbnailFn: () => of(''),
        });

        const mockViewerService: Partial<ViewerService> = {
            viewerState$: mockViewerState$.asObservable(),
            viewerLayout$: mockLayout$.asObservable(),
            datasource$: mockDatasource$.asObservable(),
            viewerConfig: ConfigDefault,
            viewerKeyboardEvent$: of(new KeyboardEvent('keydown')),
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }, ViewerToolbarService],
        });

        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockViewerState$.complete();
        mockLayout$.complete();
        mockDatasource$.complete();
        fixture.destroy();
    });

    it('should group toolbar items by their position', (done) => {
        component.orderedToolbarItems$.subscribe((toolbarData) => {
            expect(toolbarData.start.length).toBe(4);
            expect(toolbarData.start[0].type).toBe(ToolbarItemTypes.LayoutChange);
            expect(toolbarData.start[0].enabled).toBeTruthy();
            const subItems = toolbarData.start[0].subItems as { [key: string]: { id: string; selected: boolean } };
            expect(subItems['grid'].id).toBe('Grid');
            expect(subItems['grid'].selected).toBeFalsy();
            expect(subItems['vertical_scrolling'].id).toBe('Single_Vertical');
            expect(subItems['vertical_scrolling'].selected).toBeTruthy();
            expect(subItems['horizontal_scrolling'].id).toBe('Single_Horizontal');
            expect(subItems['horizontal_scrolling'].selected).toBeFalsy();
            expect(toolbarData.start[1].type).toBe(ToolbarItemTypes.ThumbnailViewer);
            expect(toolbarData.start[1].enabled).toBeFalsy();
            expect(toolbarData.start[2].type).toBe(ToolbarItemTypes.PageNavigation);
            expect(toolbarData.start[2].enabled).toBeFalsy();
            expect(toolbarData.start[3].type).toBe(ToolbarItemTypes.LayerSelection);
            expect(toolbarData.start[3].enabled).toBeFalsy();
            const subItemsTextLayer = toolbarData.start[3].subItems as { [key: string]: { id: string; selected: boolean } };
            expect(subItemsTextLayer['image'].id).toBe('image');
            expect(subItemsTextLayer['image'].selected).toBeTruthy();
            expect(subItemsTextLayer['text'].id).toBe('text');
            expect(subItemsTextLayer['text'].selected).toBeFalsy();

            expect(toolbarData.middle.length).toBe(1);
            expect(toolbarData.middle[0].type).toBe(ToolbarItemTypes.Zoom);
            expect(toolbarData.middle[0].enabled).toBeTruthy();

            expect(toolbarData.end.length).toBe(3);
            expect(toolbarData.end[0].type).toBe(ToolbarItemTypes.Rotate);
            expect(toolbarData.end[0].enabled).toBeTruthy();
            expect(toolbarData.end[2].type).toBe(ToolbarItemTypes.FullScreen);
            expect(toolbarData.end[2].enabled).toBeTruthy();
            done();
        });
    });

    it('should have default viewer state and toolbar position at the right', (done) => {
        component.currentViewerState$.subscribe((state) => {
            expect(state.currentLayout.type).toEqual(UserLayoutOptions.Single_Vertical);
            expect(state.currentToolbarPosition).toEqual('right');
            expect(state.currentZoomLevel).toEqual(100);
            done();
        });
    });

    it('should have current viewer toolbar position at the top', (done) => {
        const mockStateData = getDefaultStateData({
            ...ConfigDefault,
            toolbarPosition: ToolbarPosition.Top,
        });
        mockViewerState$.next(mockStateData);
        fixture.detectChanges();

        component.currentViewerState$.subscribe((state) => {
            expect(state.currentLayout.type).toEqual(UserLayoutOptions.Single_Vertical);
            expect(state.currentToolbarPosition).toEqual('top');
            expect(state.currentZoomLevel).toEqual(100);
            done();
        });
    });

    it('should have current viewer toolbar position at the left', (done) => {
        const mockStateData = getDefaultStateData({
            ...ConfigDefault,
            toolbarPosition: ToolbarPosition.Left,
        });
        mockViewerState$.next(mockStateData);
        fixture.detectChanges();

        component.currentViewerState$.subscribe((state) => {
            expect(state.currentLayout.type).toEqual(UserLayoutOptions.Single_Vertical);
            expect(state.currentToolbarPosition).toEqual('left');
            expect(state.currentZoomLevel).toEqual(100);
            done();
        });
    });

    it('should have current viewer toolbar position at the bottom', (done) => {
        const mockStateData = getDefaultStateData({
            ...ConfigDefault,
            toolbarPosition: ToolbarPosition.Bottom,
        });
        mockViewerState$.next(mockStateData);
        fixture.detectChanges();

        component.currentViewerState$.subscribe((state) => {
            expect(state.currentLayout.type).toEqual(UserLayoutOptions.Single_Vertical);
            expect(state.currentToolbarPosition).toEqual('bottom');
            expect(state.currentZoomLevel).toEqual(100);
            done();
        });
    });

    it('should have nativeElement', async () => {
        mockDatasource$.next({
            documents: [
                {
                    id: '1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page0',
                            name: 'page0',
                            isSelected: true,
                            panelClasses: [],
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: 'image-src', width: 100, height: 100, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        });
        fixture.detectChanges();
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.idp-viewer-toolbar__container-start')).not.toBeNull();
        expect(compiled.querySelector('.idp-viewer-toolbar__container-middle')).not.toBeNull();
        expect(compiled.querySelector('.idp-viewer-toolbar__container-end')).not.toBeNull();
    });

    it('should have no document selected initially', (done) => {
        component.noDocumentSelected$.subscribe((noDocumentSelected) => {
            expect(noDocumentSelected).toBeTruthy();
            done();
        });
    });

    it('should update noDocumentSelected$ when datasource changes', (done) => {
        mockDatasource$.next({
            documents: [],
            loadImageFn: () => of({ blobUrl: 'image-src', width: 100, height: 100, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        });
        fixture.detectChanges();

        component.noDocumentSelected$.subscribe((noDocumentSelected) => {
            expect(noDocumentSelected).toBeTruthy();
            done();
        });
    });

    it('should update noDocumentSelected$ when document selected', (done) => {
        mockDatasource$.next({
            documents: [
                {
                    id: '1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page0',
                            name: 'page0',
                            isSelected: true,
                            panelClasses: [],
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: 'image-src', width: 100, height: 100, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        });
        fixture.detectChanges();

        component.noDocumentSelected$.subscribe((noDocumentSelected) => {
            expect(noDocumentSelected).toBeFalsy();
            done();
        });
    });
});
