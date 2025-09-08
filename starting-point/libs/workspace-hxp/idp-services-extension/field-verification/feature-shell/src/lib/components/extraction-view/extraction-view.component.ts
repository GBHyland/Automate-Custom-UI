/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe, CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    HostListener,
    inject,
    Injector,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    IdpViewerComponent,
    IdpViewerDatasourceOcr,
    IdpViewerToolbarPosition,
    IdpViewerConfigOptions,
    IdpViewerUserLayoutOptions,
    IdpViewerTextLayerComponent,
    IdpViewerContentLayerDirective,
    IdpViewerTextData,
    IdpViewerTextHighlightState,
    IdpViewerEvent,
    IdpViewerTextHighlightData,
    IdpViewerOcrCandidate,
    IdpViewerEventTypes,
    IdpViewerLayerType,
    IdpViewerFooterStickyActionComponent,
} from '@hyland/idp-document-viewer';
import { ResponseFormat, ShortcutBrowserDialogComponent, TaskHeaderComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { isEqual } from 'lodash';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { MetadataPanelComponent } from '../metadata-panel/metadata-panel.component';
import { ExtractionTableComponent } from '../extraction-table/extraction-table.component';
import { ActionHistoryService } from '../../services/action-history.service';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';
import { IdpDocument, IdpField } from '../../models/screen-models';
import { findOcrMatches, IdpVerificationService } from '../../services/verification/verification.service';
import { IdpPagesMetadata } from '../../store/actions/field-verification.actions';
import Split from 'split.js';

@Component({
    selector: 'hyland-idp-extraction-view',
    templateUrl: './extraction-view.component.html',
    styleUrls: ['./extraction-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        TaskHeaderComponent,
        MetadataPanelComponent,
        ExtractionTableComponent,
        IdpViewerComponent,
        IdpViewerFooterStickyActionComponent,
        IdpViewerContentLayerDirective,
        IdpViewerTextLayerComponent,
        TranslatePipe,
        MatIconModule,
        MatTooltipModule,
        AsyncPipe,
    ],
})
export class ExtractionViewComponent implements AfterViewInit, OnDestroy {
    @ViewChild('activeTable') activeTable!: ExtractionTableComponent;

    readonly document$: Observable<IdpDocument>;
    readonly activeField$: Observable<IdpField | undefined>;
    readonly currentPageOcrWords$: Observable<IdpViewerOcrCandidate[]>;
    readonly viewerDatasource$: Observable<IdpViewerDatasourceOcr>;
    showTextLayer = true;

    get viewerHighlights() {
        return this._viewerHighlights;
    }
    private set viewerHighlights(value) {
        this._viewerHighlights = value;
    }
    private _viewerHighlights: IdpViewerTextData[] = [];

    readonly viewerTextSelected = new EventEmitter<IdpViewerTextHighlightData>();
    readonly fieldValuePending = new Subject<{ field: IdpField; pendingValue: string }>();
    readonly viewerEvent$ = new EventEmitter<IdpViewerEvent<object>>();

    private readonly verificationService = inject(IdpVerificationService);
    private readonly imageLoadingService = inject(IdpImageLoadingService);
    private readonly history = inject(ActionHistoryService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialogService = inject(MatDialog);
    private readonly injector = inject(Injector);

    readonly viewerConfiguration: Partial<IdpViewerConfigOptions> = {
        toolbarPosition: IdpViewerToolbarPosition.Right,
        defaultLayoutType: {
            type: IdpViewerUserLayoutOptions.SinglePage,
        },
    };

    showTable = false;
    instance: Split.Instance | undefined = undefined;

    constructor(destroyRef: DestroyRef) {
        this.activeField$ = this.verificationService.activeField$.pipe(takeUntilDestroyed(destroyRef));

        const getOcr$ = (pageId: string, responseFormat?: ResponseFormat) => {
            return this.imageLoadingService.getPageOcrData$(pageId, responseFormat).pipe(
                takeUntilDestroyed(this.destroyRef),
                filter(isDefined),
                map((ocrData) => {
                    if (!ocrData) {
                        return [];
                    }
                    if (responseFormat === ResponseFormat.TextLayout) {
                        return ocrData.layout;
                    }
                    return ocrData.words.map((w) => ({
                        ...w.boundingBox,
                        pageId,
                        text: w.text,
                    }));
                })
            );
        };

        this.document$ = this.verificationService.document$.pipe(takeUntilDestroyed(this.destroyRef));

        this.viewerDatasource$ = this.document$.pipe(
            map((document: IdpDocument) => {
                return {
                    id: document.id,
                    name: document.name,
                    pages: document.pages.map((page) => {
                        return {
                            id: page.id,
                            name: page.name,
                            viewerRotation: page.viewerRotation ?? 0,
                            isSelected: page.isSelected,
                            panelClasses: page.hasIssue ? ['idp-viewer__issue-page'] : [],
                        };
                    }),
                };
            }),
            distinctUntilChanged(isEqual),
            map(
                (document) =>
                    ({
                        documents: [document],
                        loadImageFn: (pageId: string) => {
                            return this.imageLoadingService.getImageDataForPage$(pageId).pipe(filter(isDefined));
                        },
                        loadThumbnailFn: (pageId: string) => {
                            return this.imageLoadingService.getImageDataForPage$(pageId, true).pipe(
                                filter(isDefined),
                                map((data) => data.blobUrl)
                            );
                        },
                        loadPageOcrFn: getOcr$,
                        // eslint-disable-next-line prettier/prettier
                    } satisfies IdpViewerDatasourceOcr)
            )
        );

        const currentPageIndex$ = this.viewerEvent$.pipe(
            filter(isPageSelectedEvent),
            map((event) => event.data?.newValue?.pageNavInfo?.currentPageIndex),
            filter(isDefined),
            startWith(0) // start with first page by default
        );
        const currentPageId$ = combineLatest([currentPageIndex$, this.document$]).pipe(
            map(([index, document]) => document.pages[index].id),
            distinctUntilChanged()
        );
        this.currentPageOcrWords$ = currentPageId$.pipe(
            switchMap((pageId) => getOcr$(pageId, ResponseFormat.Ocr) as Observable<IdpViewerOcrCandidate[]>)
        );

        let previousPageIndex = 0;
        const activeFieldHighlight$ = combineLatest([this.verificationService.activeField$, currentPageIndex$]).pipe(
            withLatestFrom(this.document$),
            map(([[field, pageIndex], document]) => {
                const pageChanging = previousPageIndex !== pageIndex;
                previousPageIndex = pageIndex;

                if (!field?.boundingBox) {
                    return undefined; // no bounding box on this field
                }
                const boxPageIndex = field.boundingBox.pageIndex ?? document.pages.findIndex((page) => page.id === field.boundingBox?.pageId);
                if (pageChanging && pageIndex !== boxPageIndex) {
                    return undefined; // moving to a different page
                }
                return {
                    ...field.boundingBox,
                    text: field.value ?? '',
                    pageId: field.boundingBox.pageId || document.pages[boxPageIndex].id,
                    highlightState: field.hasIssue ? IdpViewerTextHighlightState.INVALID : IdpViewerTextHighlightState.VALID,
                };
            })
        );

        const typeaheadHighlights$ = combineLatest([this.fieldValuePending, currentPageId$]).pipe(
            switchMap(([update, pageId]) => {
                if (!update?.pendingValue) {
                    return of([]); // no current typeahead
                }
                if (update.field.boundingBox && update.field.value === update.pendingValue) {
                    return of([]); // field already has matching box
                }
                return getOcr$(pageId, ResponseFormat.Ocr).pipe(
                    map(function* (ocrWords) {
                        if (!Array.isArray(ocrWords)) {
                            return;
                        }
                        let index = 0;
                        for (const ocrMatch of findOcrMatches(ocrWords, update.pendingValue, false, update.field.value === update.pendingValue)) {
                            if (ocrMatch.length > 0) {
                                for (const word of ocrMatch) {
                                    yield {
                                        ...word,
                                        highlightState: index === 0 ? IdpViewerTextHighlightState.PRIMARY : IdpViewerTextHighlightState.SECONDARY,
                                    };
                                }
                                index++;
                            }
                        }
                    })
                );
            })
        );

        combineLatest([activeFieldHighlight$, typeaheadHighlights$])
            .pipe(
                map(([activeFieldHighlight, typeaheadHighlights]) => {
                    return [...(activeFieldHighlight ? [activeFieldHighlight] : []), ...typeaheadHighlights];
                }),
                distinctUntilChanged(isEqual),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((viewerHighlights) => (this.viewerHighlights = viewerHighlights));

        // When the user selects some OCR text, update the active field value.
        this.viewerTextSelected
            .pipe(withLatestFrom(this.verificationService.activeField$), takeUntilDestroyed(this.destroyRef))
            .subscribe(([highlight, field]) => {
                if (field) {
                    const boundingBox = { ...expandedBoundingBox(highlight.rect.actual), pageId: highlight.pageId };
                    // Always set confidence to 1 on manual update
                    const updatedField = { ...field, value: highlight.text, boundingBox, confidence: 1 };
                    this.verificationService.updateField(updatedField, boundingBox);
                    this.fieldValuePending.next({ field: updatedField, pendingValue: updatedField.value });
                    this.verificationService.selectField(updatedField, true);
                }
            });

        this.viewerEvent$
            .pipe(
                filter((event) => event.type === IdpViewerEventTypes.ViewChanged),
                map((event) => (event.data?.newValue as { currentLayer?: IdpViewerLayerType })?.currentLayer),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((currentLayer) => {
                this.showTextLayer = currentLayer !== IdpViewerLayerType.TextOnly;
            });

        this.viewerEvent$
            .pipe(
                filter((event) => event.type === IdpViewerEventTypes.RotationChanged),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                const pages: IdpPagesMetadata[] =
                    event.data?.dataSourceRef
                        ?.filter((pageDataSource) => pageDataSource?.pageId)
                        .map((pageDataSource) => ({
                            pageId: pageDataSource.pageId,
                            documentId: pageDataSource.documentId,
                            viewerRotation: pageDataSource.viewerRotation,
                        })) ?? [];
                if (pages.length === 0) {
                    return;
                }
                this.verificationService.updatePagesRotation(pages, false);
            });
    }

    ngAfterViewInit() {
        // Listen for field type changes
        this.activeField$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((field) => {
            const isTable = field?.dataType === 'Table' || field?.tableId;
            if (isTable && !this.instance) {
                this.showTable = true;
                setTimeout(() => {
                    this.instance = Split(['#split-top', '#split-bottom'], {
                        sizes: [70, 30],
                        direction: 'vertical',
                        gutterSize: 10,
                        minSize: 150,
                        gutter: (index, direction) => {
                            const gutter = document.createElement('div');
                            gutter.className = `gutter gutter-${direction}`;
                            gutter.dataset['automationId'] = 'idp-viewer-splitter-bar';
                            return gutter;
                        },
                    });
                });
            } else if (!isTable && this.instance) {
                this.instance.destroy();
                this.instance = undefined;
                this.showTable = false;
            }
        });
    }

    ngOnDestroy() {
        if (this.instance) {
            this.instance.destroy();
        }
        this.imageLoadingService.cleanup();
    }

    @HostListener('keydown.control.z')
    onUndo() {
        this.history.undo();
    }
    @HostListener('keydown.control.y')
    onRedo() {
        this.history.redo();
    }

    onShortcutBrowserClick() {
        if (this.dialogService.openDialogs.length > 0) {
            return;
        }

        ShortcutBrowserDialogComponent.openDialog(this.dialogService, { injector: this.injector });
    }
    onShowTable() {
        this.showTable = true;
    }
}

function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

type Rect = IdpViewerTextHighlightData['rect']['actual'];

function expandedBoundingBox<T extends Rect>(rect: T) {
    const left = Math.floor(rect.left);
    const top = Math.floor(rect.top);
    const addedWidth = rect.left - left;
    const addedHeight = rect.top - top;
    return {
        ...rect,
        left,
        top,
        width: Math.ceil(rect.width + addedWidth),
        height: Math.ceil(rect.height + addedHeight),
    };
}

interface PageSelectedData {
    pageNavInfo: {
        currentPageIndex: number | undefined;
        totalPages: number;
    };
}
function isPageSelectedEvent(event: IdpViewerEvent<any>): event is IdpViewerEvent<PageSelectedData> {
    return event.type === 'PageSelected';
}
