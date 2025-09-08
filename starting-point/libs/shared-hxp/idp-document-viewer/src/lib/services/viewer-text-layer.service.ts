/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, DestroyRef, inject, Injectable } from '@angular/core';
import { asapScheduler, BehaviorSubject, combineLatest, isObservable, merge, Observable, of, Subject } from 'rxjs';
import {
    bufferWhen,
    concatMap,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    observeOn,
    scan,
    shareReplay,
    switchMap,
    take,
    takeUntil,
    throttleTime,
    withLatestFrom,
} from 'rxjs/operators';
import { Rect, ScaledSizeInfo, TextRect } from '../models/text-layer/size';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { ViewerService } from './viewer.service';
import { RubberBandPrimitive } from '../models/text-layer/rubber-band-primitive';
import { ViewerLayerHostData } from '../models/viewer-layer';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewerTextData, ViewerTextHighlightData } from '../models/text-layer/ocr-candidate';
import { DatasourceOcr, isDatasourceOcr, ResponseFormat } from '../models/datasource';
import { ViewerShortcutAction, ViewerShortcutService } from './viewer-shortcut.service';
import { NotificationService } from '@alfresco/adf-core';
import { Clipboard } from '@angular/cdk/clipboard';

interface HostData {
    documentId: string;
    pageId: string;
    contentNaturalWidth: number;
    contentNaturalHeight: number;
    correctionAngle?: number;
}

@Injectable()
export class ViewerTextLayerService {
    private readonly initialized$ = new BehaviorSubject<HostData | undefined>(undefined);
    private readonly containerResize$ = new BehaviorSubject<Rect>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    });

    private readonly currentContainerSize$: Observable<ScaledSizeInfo>;

    private readonly allTextData$: Observable<HighlightPrimitive[]>;
    readonly scaledAllTextData$: Observable<HighlightPrimitive[]>;

    readonly textLayoutData$ = new Observable<string>();

    readonly tooltip$: Observable<TextRect[]>;
    readonly textSelection$: Observable<ViewerTextHighlightData>;

    private readonly activeHighlightsSubject$ = new Subject<ViewerTextData[]>();
    readonly scaledActiveHighlights$: Observable<HighlightPrimitive[]>;
    private readonly autoNavigationToHighlight$ = new BehaviorSubject<boolean>(false);
    private readonly handleClipboard$ = new BehaviorSubject<boolean>(true);

    private readonly rubberBandAreaSelectionSubject$ = new BehaviorSubject<RubberBandPrimitive | undefined>(undefined);
    readonly rubberBandAreaSelection$ = this.rubberBandAreaSelectionSubject$.asObservable();

    private readonly mouseMove$ = new Subject<MouseEvent>();
    private readonly mouseDown$ = new Subject<MouseEvent>();
    private readonly mouseUp$ = new Subject<MouseEvent>();
    private readonly mouseClick$ = new Subject<MouseEvent>();
    private readonly mouseLeave$ = new Subject<MouseEvent>();

    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly clipboard = inject(Clipboard);
    private readonly notificationService: NotificationService = inject(NotificationService);
    private readonly shortcutService = inject(ViewerShortcutService);

    constructor() {
        this.currentContainerSize$ = combineLatest([this.initialized$.pipe(filter((hostData) => !!hostData)), this.containerResize$]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([hostData, size]) => {
                if (!hostData) {
                    throw new Error('Host data not initialized');
                }

                if (hostData.correctionAngle === 90 || hostData.correctionAngle === 270) {
                    const temp = hostData.contentNaturalWidth;
                    hostData.contentNaturalWidth = hostData.contentNaturalHeight;
                    hostData.contentNaturalHeight = temp;
                }

                const scaleX = size.width / hostData.contentNaturalWidth;
                const scaleY = size.height / hostData.contentNaturalHeight;
                const averageScale = (scaleX + scaleY) / 2;
                const sizeInfo: ScaledSizeInfo = {
                    width: size.width,
                    height: size.height,
                    top: size.top,
                    left: size.left,
                    scale: averageScale,
                    baseSize: {
                        width: hostData.contentNaturalWidth,
                        height: hostData.contentNaturalHeight,
                    },
                };
                return sizeInfo;
            })
        );

        this.allTextData$ = this.viewerService.datasource$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((datasource) => isDatasourceOcr(datasource)),
            map((datasource) => (datasource as DatasourceOcr).loadPageOcrFn),
            distinctUntilChanged(),
            this.combineHostData(),
            switchMap(([loadPageOcrFn, hostData]) => {
                const pageOcrResult = loadPageOcrFn(hostData.pageId, ResponseFormat.Ocr);
                return isObservable(pageOcrResult) ? pageOcrResult : of(pageOcrResult);
            }),
            map((pageOcrData) => {
                if (typeof pageOcrData === 'string') {
                    return [];
                }
                return pageOcrData.map((element) => HighlightPrimitive.fromTextData(element));
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.textLayoutData$ = this.viewerService.datasource$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((datasource) => isDatasourceOcr(datasource)),
            map((datasource) => (datasource as DatasourceOcr).loadPageOcrFn),
            distinctUntilChanged(),
            this.combineHostData(),
            switchMap(([loadPageOcrFn, hostData]) => {
                const pageLayoutResult = loadPageOcrFn(hostData.pageId, ResponseFormat.TextLayout);
                return isObservable(pageLayoutResult) ? pageLayoutResult : of(pageLayoutResult);
            }),
            map((result) => (typeof result === 'string' ? result : '')),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.scaledAllTextData$ = this.allTextData$.pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((elements) =>
                this.currentContainerSize$.pipe(
                    map((size) => size.scale),
                    distinctUntilChanged(),
                    map((scale) => {
                        for (const element of elements) {
                            element.scale(scale);
                        }
                        return elements;
                    })
                )
            ),
            shareReplay({ bufferSize: 1, refCount: false })
        );

        this.scaledActiveHighlights$ = this.activeHighlightsSubject$.pipe(
            takeUntilDestroyed(this.destroyRef),
            this.combineHostData(),
            map(([elements, hostData]) => elements.filter((element) => element.pageId === hostData.pageId)),
            switchMap((elements) => {
                const highlightElements = elements.map((element) => HighlightPrimitive.fromTextData(element));
                return this.currentContainerSize$.pipe(
                    map((size) => size.scale),
                    distinctUntilChanged(),
                    map((scale) => {
                        for (const element of highlightElements) {
                            element.scale(scale);
                        }
                        return highlightElements;
                    })
                );
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        const rubberBandComplete$ = merge(
            this.mouseUp$.pipe(filter((ev) => ev.button === 0)),
            this.mouseLeave$.pipe(
                filter((ev) => ev.buttons === 1),
                debounceTime(100, asapScheduler)
            )
        );
        const mousedownOutsideRubberBand$ = this.mouseDown$.pipe(
            withLatestFrom(this.rubberBandAreaSelection$),
            filter(([ev, rubberBand]) => {
                if (!rubberBand) {
                    return false;
                }
                return !rubberBand.isPointWithinScaled(ev.offsetX, ev.offsetY);
            }),
            map(([event]) => ({ event }))
        );

        merge(
            this.scaledActiveHighlights$.pipe(map(() => ({ ev: undefined, action: 'reset' as const }))),
            mousedownOutsideRubberBand$.pipe(map(({ event }) => ({ ev: event, action: 'reset' as const }))),
            rubberBandComplete$.pipe(map((ev) => ({ ev, action: 'complete' as const }))),
            this.mouseDown$.pipe(
                // start rubberBand on left click drag
                filter((ev) => ev.button === 0),
                switchMap(() => this.mouseMove$.pipe(takeUntil(rubberBandComplete$))),
                throttleTime(30, asapScheduler, { leading: true, trailing: true }),
                map((ev) => ({ ev, action: 'create' as const }))
            )
        )
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                withLatestFrom(this.currentContainerSize$.pipe(map((size) => size.scale))),
                scan(
                    (
                        accumulator:
                            | {
                                  rubberBand: RubberBandPrimitive | undefined;
                                  action: 'create' | 'reset' | 'complete' | 'none';
                                  scale: number;
                              }
                            | undefined,
                        [{ ev, action }, containerScale]
                    ) => {
                        const newAction =
                            (action === 'complete' && [undefined, 'complete', 'none'].includes(accumulator?.action)) ||
                            (action === 'reset' && accumulator?.rubberBand === undefined)
                                ? ('none' as const)
                                : action;

                        if (action === 'reset' || ev === undefined) {
                            // eslint-disable-next-line unicorn/no-useless-undefined
                            return undefined;
                        }
                        if (action === 'complete') {
                            return { rubberBand: accumulator?.rubberBand, action: newAction, scale: containerScale };
                        }

                        let rubberBand = accumulator?.rubberBand;
                        rubberBand = rubberBand ? this.updateRubberBand(rubberBand, ev, containerScale) : this.createRubberBand(ev, containerScale);
                        return { rubberBand, action: newAction, scale: containerScale };
                    },
                    // eslint-disable-next-line unicorn/no-useless-undefined
                    undefined
                ),
                filter((data) => data?.action !== 'none'),
                concatMap((data) => {
                    if (!data?.rubberBand) {
                        // eslint-disable-next-line unicorn/no-useless-undefined
                        return of(undefined);
                    }
                    if (data.action === 'complete') {
                        return this.completeRubberBand(data.rubberBand, data.scale);
                    }
                    return of(data.rubberBand);
                }),
                shareReplay({ bufferSize: 1, refCount: true })
            )
            .subscribe((rubberBand) => this.rubberBandAreaSelectionSubject$.next(rubberBand));

        this.tooltip$ = merge(
            this.mouseMove$.pipe(
                filter((ev) => ev.buttons === 0),
                throttleTime(100, asapScheduler)
            ),
            this.mouseLeave$
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((event) => {
                if (event.type === 'mouseleave') {
                    return of([]);
                }
                return this.getTextElementsAtMousePosition(event);
            }),
            concatMap((tooltipElements) => {
                return this.currentContainerSize$.pipe(
                    take(1),
                    map((containerSize) => {
                        const bufferHeight = 5;
                        const tooltipElementHeight = 50;
                        return tooltipElements.map((element) => {
                            const { left, top, width, height } = element.rect.scaled;
                            const text = element.text;

                            const offsetTooltipTop =
                                top + height + bufferHeight + tooltipElementHeight > containerSize.height
                                    ? top - tooltipElementHeight - bufferHeight
                                    : top + height + bufferHeight;

                            return { left, top: offsetTooltipTop, width, height, text };
                        });
                    })
                );
            })
        );

        // Double Click on text element
        this.textSelection$ = this.mouseClick$.pipe(
            bufferWhen(() => this.mouseClick$.pipe(throttleTime(300, asapScheduler, { leading: false, trailing: true }))),
            takeUntilDestroyed(this.destroyRef),
            filter((clicks) => clicks.length === 2),
            observeOn(asapScheduler),
            switchMap(([ev]) => {
                return this.getTextElementsAtMousePosition(ev).pipe(
                    take(1),
                    map((elements) => elements[0])
                );
            }),
            filter((element) => !!element)
        );

        this.initialized$
            .pipe(
                filter((hostData) => !!hostData),
                switchMap((hostData) =>
                    this.activeHighlightsSubject$.pipe(
                        withLatestFrom(this.autoNavigationToHighlight$),
                        map(([highlights, autoNavigationToHighlight]) => ({ highlights, hostData, autoNavigationToHighlight }))
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({ highlights, hostData, autoNavigationToHighlight }) => {
                const highlightWithDifferentPageId = highlights.find((highlight) => highlight.pageId !== hostData?.pageId);
                if (hostData !== undefined && highlightWithDifferentPageId && autoNavigationToHighlight) {
                    this.viewerService.changePageById(highlightWithDifferentPageId.pageId);
                    this.changeDetectorRef.detectChanges();
                }
            });

        this.textSelection$
            .pipe(
                withLatestFrom(this.handleClipboard$),
                filter(([, handleClipboard]) => handleClipboard),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([info]) => this.copyText(info.text));

        this.viewerService.viewerKeyboardEvent$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((event) => {
                    const shortcut = this.shortcutService.getShortcutForEvent(event);
                    if (shortcut?.action === ViewerShortcutAction.CopyToClipboard) {
                        return this.rubberBandAreaSelection$.pipe(take(1), withLatestFrom(this.handleClipboard$));
                    }
                    return of(null);
                }),
                filter((result): result is [RubberBandPrimitive, boolean] => !!result)
            )
            .subscribe(([rubberBand, handleClipboard]) => {
                if (handleClipboard && rubberBand) {
                    this.copyText(rubberBand.textData.text);
                }
            });
    }

    initialize(hostData: ViewerLayerHostData): void {
        const { documentId, pageId } = hostData;
        const contentNaturalWidth = hostData.contentNaturalWidth;
        const contentNaturalHeight = hostData.contentNaturalHeight;

        if (
            !documentId ||
            !pageId ||
            Number.isNaN(contentNaturalWidth) ||
            contentNaturalWidth <= 0 ||
            Number.isNaN(contentNaturalHeight) ||
            contentNaturalHeight <= 0
        ) {
            throw new Error(`invalid "host" data provided to the text layer: ${(JSON.stringify(hostData), undefined, 2)}`);
        }

        const internalHostData: HostData = { ...hostData, contentNaturalWidth, contentNaturalHeight };
        this.initialized$.next(internalHostData);
    }

    onResize(size: Rect | undefined): void {
        if (!size || size.width <= 0 || size.height <= 0) {
            return;
        }

        this.containerResize$.next(size);
    }

    setActivePrimitives(primitives: ViewerTextData[]): void {
        this.activeHighlightsSubject$.next(primitives);
    }

    setAutoNavigationToHighlight(autoNavigationToHighlight: boolean): void {
        this.autoNavigationToHighlight$.next(autoNavigationToHighlight);
    }

    setHandleClipboard(handleClipboard: boolean): void {
        this.handleClipboard$.next(handleClipboard);
    }

    onMouseMove(event: MouseEvent): void {
        asapScheduler.schedule(() => this.mouseMove$.next(event));
    }

    onMouseDown(event: MouseEvent): void {
        asapScheduler.schedule(() => this.mouseDown$.next(event));
    }

    onMouseUp(event: MouseEvent): void {
        asapScheduler.schedule(() => this.mouseUp$.next(event));
    }

    onMouseClick(event: MouseEvent): void {
        asapScheduler.schedule(() => this.mouseClick$.next(event));
    }

    onMouseLeave(event: MouseEvent): void {
        asapScheduler.schedule(() => this.mouseLeave$.next(event));
    }

    private copyText(text: string): void {
        this.clipboard.copy(text);
        this.notificationService.showInfo('VIEWER.SERVICES.VIEWER.CLIPBOARD_COPY_SUCCESS');
    }

    private getTextElementsAtMousePosition(event: MouseEvent): Observable<ViewerTextHighlightData[]> {
        const source$ = this.rubberBandAreaSelection$.pipe(
            take(1),
            concatMap((rubberBand) => (rubberBand ? of([rubberBand]) : this.scaledAllTextData$))
        );
        return source$.pipe(
            take(1),
            map((elements) => {
                const x = event.offsetX;
                const y = event.offsetY;

                return elements
                    .filter((element) => {
                        const { left, top, width, height } = element.rect;
                        return x >= left && x <= left + width && y >= top && y <= top + height;
                    })
                    .map((element) => element.toTextHighlightData());
            })
        );
    }

    private createRubberBand(event: MouseEvent, containerScale: number): RubberBandPrimitive {
        return RubberBandPrimitive.newInstance(event.offsetX, event.offsetY, 0, 0, containerScale);
    }

    private updateRubberBand(rubberBand: RubberBandPrimitive, event: MouseEvent, containerScale: number): RubberBandPrimitive {
        rubberBand.scale(containerScale);
        const offsetX = event.offsetX - rubberBand.rect.left;
        const offsetY = event.offsetY - rubberBand.rect.top;
        rubberBand.setWidthScaled(offsetX, containerScale);
        rubberBand.setHeightScaled(offsetY, containerScale);
        return rubberBand;
    }

    private completeRubberBand(rubberBand: RubberBandPrimitive, containerScale: number): Observable<RubberBandPrimitive> {
        return this.scaledAllTextData$.pipe(
            this.combineHostData(),
            take(1),
            map(([allTextData, hostData]) => {
                let minX = -1;
                let minY = -1;
                let maxX = 0;
                let maxY = 0;
                const rubberBandTextElements: string[] = [];

                for (const textData of allTextData) {
                    if (
                        rubberBand.isPointWithinScaled(textData.rect.left, textData.rect.top) &&
                        rubberBand.isPointWithinScaled(textData.rect.left + textData.rect.width, textData.rect.top + textData.rect.height)
                    ) {
                        if (minX === -1) {
                            minX = textData.rect.left;
                        }

                        if (minY === -1) {
                            minY = textData.rect.top;
                        }

                        if (minX > textData.rect.left) {
                            minX = textData.rect.left;
                        }

                        if (minY > textData.rect.top) {
                            minY = textData.rect.top;
                        }

                        if (maxX < textData.rect.left + textData.rect.width) {
                            maxX = textData.rect.left + textData.rect.width;
                        }

                        if (maxY < textData.rect.top + textData.rect.height) {
                            maxY = textData.rect.top + textData.rect.height;
                        }

                        rubberBandTextElements.push(textData.textData.text);
                    }
                }

                const widthBuffer = 0.05 * (maxX - minX);
                const heightBuffer = 0.05 * (maxY - minY);

                rubberBand.setLeftScaled(minX - widthBuffer, containerScale);
                rubberBand.setTopScaled(minY - heightBuffer, containerScale);
                rubberBand.setWidthScaled(maxX - minX + 2 * widthBuffer, containerScale);
                rubberBand.setHeightScaled(maxY - minY + 2 * heightBuffer, containerScale);
                rubberBand.setText(rubberBandTextElements.join(' '), hostData.pageId);
                return rubberBand;
            })
        );
    }

    private combineHostData() {
        return <T>(source: Observable<T>): Observable<readonly [T, HostData]> => {
            return source.pipe(
                switchMap((data) => {
                    return this.initialized$.pipe(
                        filter((hostData) => !!hostData),
                        map((hostData) => {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            return [data, hostData!] as const;
                        })
                    );
                })
            );
        };
    }
}
