/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, from, isObservable, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ViewerService } from '../services/viewer.service';
import { LayoutDirection, LayoutInfo, LayoutType, UserLayoutOptions } from '../models/layout';
import { EmptyComponent } from '../viewer-empty/viewer-empty.component';
import { SingleScrollableViewComponent } from './single-scrollable-view/single-scrollable-view.component';
import { GridViewComponent } from './grid-view/grid-view.component';
import { SinglePageViewComponent } from './single-page-view/single-page-view.component';
import { ViewerImageData } from '../models/viewer-image-data';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventTypes } from '../models/events';
import { ViewerLayer, ViewerLayerType } from '../models/viewer-layer';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { ToolbarConfig } from '../models/toolbar-config';
import { ViewerTextOnlyLayerComponent } from '../viewer-text-only-layer/viewer-text-only-layer.component';

const LAYER_TYPE = ViewerLayerType.Image;
@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        EmptyComponent,
        SinglePageViewComponent,
        SingleScrollableViewComponent,
        GridViewComponent,
        ViewerTextOnlyLayerComponent,
    ],
    selector: 'hyland-idp-viewer-image-layer',
    templateUrl: './image-layer.component.html',
    styleUrls: ['./image-layer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLayerComponent implements AfterViewInit, OnDestroy {
    @Input() projectedEmptyComponent?: TemplateRef<EmptyComponent>;
    @ViewChild('idpViewerContainer') idpViewerContainer?: ElementRef;

    private readonly viewInitialized$ = new BehaviorSubject<boolean>(false);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerLayerService: ViewerLayerService = inject(ViewerLayerService);
    readonly displayImages$: Observable<ViewerImageData[]>;
    readonly totalPageCount$: Observable<number>;
    readonly viewerLayout$: Observable<LayoutInfo>;
    readonly pageUniquenessFn = (i: number, image: ViewerImageData) => image?.pageId;
    readonly layoutTypes = LayoutType;
    readonly viewerLayers$: Observable<ReadonlyArray<ViewerLayer>>;
    readonly isTextOnly$: Observable<boolean>;
    bestFit = true;

    constructor() {
        this.viewerLayerService.registerLayer({ type: LAYER_TYPE });

        this.viewerLayers$ = this.viewerLayerService.layersChanged$.pipe(
            takeUntilDestroyed(this.destroyRef),
            startWith(this.viewerLayerService.getLayers()),
            map((layers) => layers.filter((layer) => layer.type !== LAYER_TYPE))
        );

        this.totalPageCount$ = this.viewerService.totalPageCount$;

        this.displayImages$ = combineLatest([
            this.viewerService.datasource$,
            this.viewerService.viewerState$.pipe(
                map((s) => s.pageNavInfo.currentPageIndex),
                distinctUntilChanged()
            ),
            this.viewerService.viewerState$.pipe(
                map((s) => s.bestFit),
                distinctUntilChanged()
            ),
            this.viewInitialized$.pipe(distinctUntilChanged()),
            this.viewerService.viewerState$.pipe(
                map((s) => s.rotationStep),
                distinctUntilChanged()
            ),
            this.viewerService.viewerState$.pipe(
                map((s) => s.fullscreen),
                distinctUntilChanged()
            ),
            this.viewerService.viewerState$.pipe(
                map((state) => state.selectedToolbarItems.includes(ToolbarConfig.ThumbnailViewer.type)),
                distinctUntilChanged()
            ),
        ]).pipe(
            withLatestFrom(this.viewerService.viewerState$.pipe(map((s) => s.currentLayout.type))),
            map(([[datasource, selectedPageIndex, bestFit, viewInitialized], layout]) => {
                const pageImages: ViewerImageData[] = [];
                const multiDocumentView = datasource.documents.length > 1;
                for (const doc of datasource.documents) {
                    for (let index = 0; index < doc.pages.length; index++) {
                        const page = doc.pages[index];
                        const result = datasource.loadImageFn(page.id);
                        const imageData$ = isObservable(result) ? result : result instanceof Promise ? from(result) : of(result);
                        pageImages.push({
                            pageId: page.id,
                            documentId: doc.id,
                            pageName: page.name,
                            pageNumber: index + 1,
                            documentName: doc.name,
                            firstPageInDoc: index === 0,
                            lastPageInDoc: index === doc.pages.length - 1,
                            multiDocumentView,
                            customClassToApply: page.panelClasses || [],
                            image$: imageData$.pipe(
                                map((imageData) => {
                                    const containerElement = this.idpViewerContainer?.nativeElement;
                                    const { width, height } = imageData;

                                    const buffer = 60;
                                    if (layout === UserLayoutOptions.SinglePage) {
                                        if (bestFit && viewInitialized && containerElement) {
                                            const aspectRatio = width / height;
                                            const { newWidth, newHeight } = this.calculateNewDimensions(
                                                containerElement.clientWidth,
                                                containerElement.clientHeight - buffer,
                                                (page.viewerRotation ?? 0) + (imageData?.correctionAngle ?? 0)
                                            );
                                            const viewerWidth = newWidth;
                                            const viewerHeight = newHeight;

                                            const viewerAspectRatio = viewerWidth / viewerHeight;

                                            const [finalWidth, finalHeight] =
                                                aspectRatio > viewerAspectRatio
                                                    ? [viewerWidth, viewerWidth / aspectRatio]
                                                    : [viewerHeight * aspectRatio, viewerHeight];

                                            return {
                                                ...imageData,
                                                viewerRotation: page.viewerRotation,
                                                width: finalWidth,
                                                height: finalHeight,
                                                naturalWidth: width,
                                                naturalHeight: height,
                                            };
                                        }
                                        return {
                                            ...imageData,
                                            viewerRotation: page.viewerRotation,
                                            width: width,
                                            height: height,
                                            naturalWidth: width,
                                            naturalHeight: height,
                                        };
                                    } else {
                                        const { newWidth, newHeight } = this.calculateNewDimensions(
                                            imageData.width,
                                            imageData.height,
                                            (page.viewerRotation ?? 0) + (imageData?.correctionAngle ?? 0)
                                        );
                                        if (bestFit && viewInitialized && containerElement) {
                                            const aspectRatio = newWidth / newHeight;

                                            const viewerWidth = containerElement.clientWidth;
                                            const viewerHeight = containerElement.clientHeight - buffer;
                                            const viewerAspectRatio = viewerWidth / viewerHeight;

                                            const [finalWidth, finalHeight] =
                                                aspectRatio > viewerAspectRatio
                                                    ? [viewerWidth, viewerWidth / aspectRatio]
                                                    : [viewerHeight * aspectRatio, viewerHeight];

                                            return {
                                                ...imageData,
                                                viewerRotation: page.viewerRotation,
                                                width: finalWidth,
                                                height: finalHeight,
                                                naturalWidth: width,
                                                naturalHeight: height,
                                            };
                                        }
                                        return {
                                            ...imageData,
                                            viewerRotation: page.viewerRotation,
                                            width: newWidth,
                                            height: newHeight,
                                            naturalWidth: width,
                                            naturalHeight: height,
                                        };
                                    }
                                }),
                                shareReplay({ bufferSize: 1, refCount: true })
                            ),
                        });
                    }
                }
                return selectedPageIndex === undefined ? pageImages : [pageImages[selectedPageIndex]];
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.viewerLayout$ = combineLatest([
            this.viewerService.viewerLayout$,
            this.displayImages$.pipe(
                map((images) => images.length),
                distinctUntilChanged()
            ),
            this.viewerService.viewerState$.pipe(
                map((state) => state.currentZoomLevel / this.viewerService.viewerConfig.defaultZoomLevel),
                distinctUntilChanged()
            ),
        ]).pipe(
            map(([layout, numberOfImages, currentScaleFactor]) => {
                const type = numberOfImages > 0 ? layout.type : LayoutType.None;
                const scrollDirection = layout.type === LayoutType.SingleScrollable ? layout.layoutDirection : undefined;

                let fullViewerScreen = true;
                let columnWidthPercent = 100;
                let rowHeightPercent = 100;
                let singleRowView = false;

                switch (type) {
                    case LayoutType.SingleScrollable: {
                        columnWidthPercent = layout.layoutDirection === LayoutDirection.Vertical ? 80 : 90;
                        rowHeightPercent = layout.layoutDirection === LayoutDirection.Vertical ? 90 : 80;

                        columnWidthPercent = columnWidthPercent * currentScaleFactor;
                        rowHeightPercent = rowHeightPercent * currentScaleFactor;
                        break;
                    }
                    case LayoutType.SinglePage: {
                        columnWidthPercent = 95;
                        rowHeightPercent = 95;

                        columnWidthPercent = columnWidthPercent * currentScaleFactor;
                        rowHeightPercent = rowHeightPercent * currentScaleFactor;
                        break;
                    }
                    case LayoutType.Grid: {
                        const columnCount = layout.columns;
                        const rowCount = layout.rows;
                        columnWidthPercent = 100 / columnCount;
                        rowHeightPercent = rowCount === 1 ? (columnCount > 2 ? 70 : 90) : rowCount === 2 ? 45 : 100 / rowCount;
                        fullViewerScreen = numberOfImages > rowCount * columnCount;
                        singleRowView = numberOfImages <= columnCount;
                        break;
                    }
                    default: {
                        break;
                    }
                }

                return { type, columnWidthPercent, rowHeightPercent, fullViewerScreen, singleRowView, scrollDirection, currentScaleFactor };
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.isTextOnly$ = this.viewerService.viewerState$.pipe(
            map((config) => config.currentLayer === ViewerLayerType.TextOnly),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    ngAfterViewInit() {
        this.viewInitialized$.next(true);
    }

    ngOnDestroy() {
        this.viewInitialized$.next(false);
        this.viewerLayerService.unregisterLayer(LAYER_TYPE);
    }

    onImageLoaded(documentId: string, pageId: string) {
        this.viewerService.changeViewerState(
            {
                currentDocumentId: documentId,
                currentPageId: pageId,
            },
            EventTypes.ImageLoaded
        );
    }

    private calculateNewDimensions(width: number, height: number, angle: number): { newWidth: number; newHeight: number } {
        const normalizedAngle = angle % 360;
        const isRotated = normalizedAngle === 90 || normalizedAngle === 270;
        return {
            newWidth: isRotated ? height : width,
            newHeight: isRotated ? width : height,
        };
    }
}
