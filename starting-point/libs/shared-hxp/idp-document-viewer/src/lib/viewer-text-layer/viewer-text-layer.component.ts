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
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Rect, TextRect } from '../models/text-layer/size';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerTextHighlightData, ViewerTextHighlightInfo } from '../models/text-layer/ocr-candidate';
import { ViewerService } from '../services/viewer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RubberBandPrimitive } from '../models/text-layer/rubber-band-primitive';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { CommonModule } from '@angular/common';

export type TooltipInfo = TextRect & { rotation: number; scale: number };

const LAYER_TYPE = ViewerLayerType.TextSuperImposed;

@Component({
    selector: 'hyland-idp-viewer-text-layer',
    templateUrl: './viewer-text-layer.component.html',
    styleUrls: ['./viewer-text-layer.component.scss'],
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerTextLayerComponent implements AfterViewInit, OnDestroy {
    @Input() host!: ViewerLayerHostData;

    @Input() set autoNavigationToHighlight(value: boolean) {
        this.viewerTextService.setAutoNavigationToHighlight(value);
    }

    @Input() set handleClipboard(value: boolean) {
        this.viewerTextService.setHandleClipboard(value);
    }

    @Output() activeHighlightInfoChange = new EventEmitter<ViewerTextHighlightInfo>();
    @Output() textSelected = new EventEmitter<ViewerTextHighlightData>();

    @ViewChild('canvas') canvasElement?: ElementRef<HTMLCanvasElement>;
    get canvasContext(): CanvasRenderingContext2D | undefined {
        return this.canvasElement?.nativeElement?.getContext('2d') ?? undefined;
    }

    canvasWidth = 0;
    canvasHeight = 0;

    readonly toolTips$: Observable<TooltipInfo[]>;
    readonly toolTipUniquenessFn = (_: number, item: TooltipInfo) => `${item.height}+${item.width}+${item.left}+${item.top}`;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly zone: NgZone = inject(NgZone);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerTextService: ViewerTextLayerService = inject(ViewerTextLayerService);
    private readonly viewerLayerService: ViewerLayerService = inject(ViewerLayerService);
    private readonly resizeObserverService: ResizeObserverService = inject(ResizeObserverService);
    private changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
    private readonly resized$ = new Subject<Rect>();

    constructor() {
        const registeredLayers = this.viewerLayerService.getLayers();
        if (!registeredLayers.some((layer) => layer.type === LAYER_TYPE)) {
            throw new Error(`${LAYER_TYPE} layer is not registered.`);
        }

        this.resized$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((rect) => {
            this.canvasWidth = rect.width;
            this.canvasHeight = rect.height;
            this.changeDetector.markForCheck();

            this.viewerTextService.onResize(rect);
        });

        this.toolTips$ = combineLatest([
            this.viewerTextService.tooltip$,
            this.viewerService.viewerState$.pipe(
                map((state) => state.currentZoomLevel),
                distinctUntilChanged()
            ),
            this.viewerService.viewerState$.pipe(
                map((state) => state.rotationStep),
                distinctUntilChanged()
            ),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([tooltips, zoom]) => {
                if (!tooltips) {
                    return [];
                }

                return tooltips.map((tooltip) => ({
                    ...tooltip,
                    rotation: -(this.host.viewerRotation ?? 0),
                    scale: 100 / zoom,
                }));
            })
        );

        combineLatest([
            this.viewerTextService.scaledActiveHighlights$.pipe(debounceTime(50)),
            this.viewerService.viewerState$.pipe(
                map((s) => s.rotationStep),
                distinctUntilChanged()
            ),
            this.resized$,
        ])
            .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
            .subscribe(([highlights, rotation]) => {
                this.drawActiveHighlights(highlights);

                const textHighlights = highlights.map((highlight) => highlight.toTextHighlightData());
                this.activeHighlightInfoChange.emit({ highlights: textHighlights, rotation });
            });

        this.viewerTextService.textSelection$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((info) => this.textSelected.emit(info));

        this.viewerTextService.rubberBandAreaSelection$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.drawRubberBand.bind(this));
    }

    ngAfterViewInit(): void {
        this.initializeWithHost();
        this.observeResize();
    }

    ngOnDestroy(): void {
        if (this.canvasElement?.nativeElement) {
            this.resizeObserverService.unobserve(this.canvasElement.nativeElement);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.viewerTextService.onMouseMove(event);
    }

    onMouseDown(event: MouseEvent): void {
        this.viewerTextService.onMouseDown(event);
    }

    onMouseUp(event: MouseEvent): void {
        this.viewerTextService.onMouseUp(event);
    }

    onMouseClick(event: MouseEvent): void {
        this.viewerTextService.onMouseClick(event);
    }

    onMouseLeave(event: MouseEvent): void {
        this.viewerTextService.onMouseLeave(event);
    }

    private initializeWithHost(): void {
        if (!this.host) {
            throw new Error(`"host" input is required for ${LAYER_TYPE} layer.`);
        }

        this.viewerTextService.initialize(this.host);
    }

    private observeResize(): void {
        if (!this.canvasElement?.nativeElement) {
            return;
        }

        this.resizeObserverService.observe(this.canvasElement.nativeElement).subscribe((sizeChange) => {
            const elementBoundingRect = sizeChange?.target?.getBoundingClientRect();

            const width = sizeChange?.contentRect.width ?? 0;
            const height = sizeChange?.contentRect.height ?? 0;
            const top = elementBoundingRect?.top ?? sizeChange?.contentRect.top ?? 0;
            const left = elementBoundingRect?.left ?? sizeChange?.contentRect.left ?? 0;

            if (width === 0 || height === 0) {
                return;
            }

            this.resized$.next({ width, height, top, left });
        });
    }

    private drawActiveHighlights(highlights: HighlightPrimitive[]): void {
        const context = this.canvasContext;
        if (!context) {
            return;
        }
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (const highlight of highlights) {
            highlight.draw(context, { width: this.canvasWidth, height: this.canvasHeight });
        }
        this.changeDetector.detectChanges();
    }

    private drawRubberBand(rubberBand: RubberBandPrimitive | undefined): void {
        this.zone.run(() => {
            const context = this.canvasContext;
            if (!context) {
                return;
            }
            context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            if (rubberBand) {
                rubberBand.draw(context, { width: this.canvasWidth, height: this.canvasHeight });
            }
        });
    }
}
