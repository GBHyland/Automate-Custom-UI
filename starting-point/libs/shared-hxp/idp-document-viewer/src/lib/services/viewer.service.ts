/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { asapScheduler, asyncScheduler, BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Datasource, DatasourceOcr } from '../models/datasource';
import { getDefaultStateData, isSameLayoutState, StateData } from '../models/state-data';
import { ConfigOptions, ToolbarPosition } from '../models/config-options';
import { ConfigDefault } from '../models/config-default';
import { debounceTime, distinctUntilChanged, filter, map, observeOn, shareReplay, take, withLatestFrom } from 'rxjs/operators';
import { Layout, LayoutConfig, LayoutType, UserLayoutOptionConfig, UserLayoutOptions } from '../models/layout';
import { EventTypes, isInstanceOfHxIdpViewerEvent, ViewerEvent } from '../models/events';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatDate } from '../utils/date-utils';
import { NotificationService } from '@alfresco/adf-core';
import { ToolbarItemTypes } from '../models/toolbar';
import { ViewerLayerType } from '../models/viewer-layer';

const defaultLoadFn = () => new Observable<never>();

export const DatasourceDefault: Datasource = {
    documents: [],
    loadImageFn: defaultLoadFn,
    loadThumbnailFn: defaultLoadFn,
};

export interface ViewerPageInfo {
    pageId: string;
    rotation: number;
}

@Injectable()
export class ViewerService {
    private viewerConfiguration: ConfigOptions = ConfigDefault;

    private readonly datasourceSubject$ = new BehaviorSubject<Datasource | DatasourceOcr>(DatasourceDefault);
    readonly datasource$ = this.datasourceSubject$.asObservable();

    private readonly viewerStateSubject$ = new BehaviorSubject<StateData>(getDefaultStateData(this.viewerConfiguration));
    readonly viewerState$ = this.viewerStateSubject$.asObservable();
    readonly totalPageCount$: Observable<number>;

    readonly viewerLayout$: Observable<Layout>;
    private readonly userSelectedLayout$ = new Subject<UserLayoutOptions>();

    private readonly viewerEventSubject$ = new Subject<ViewerEvent<object>>();
    readonly viewerEvent$ = this.viewerEventSubject$.asObservable();

    private readonly viewerKeyboardEventSubject$ = new Subject<KeyboardEvent>();
    readonly viewerKeyboardEvent$ = this.viewerKeyboardEventSubject$.asObservable();

    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly notificationService: NotificationService = inject(NotificationService);

    get viewerConfig(): Readonly<ConfigOptions> {
        return Object.freeze(this.viewerConfiguration);
    }

    constructor() {
        this.viewerLayout$ = this.viewerState$.pipe(
            map((state) => state.currentLayout),
            distinctUntilChanged((prev, curr) => isSameLayoutState(prev, curr)),
            map((state) => {
                const layout = UserLayoutOptionConfig[state.type].layout;
                return {
                    ...layout,
                    availableActions: state.availableActions ?? layout.availableActions,
                    ...(state.override ? { rows: state.override.rows, columns: state.override.columns } : {}),
                };
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.totalPageCount$ = this.datasource$.pipe(
            map((ds: Datasource) => ds.documents.reduce((acc, doc) => acc + doc.pages.length, 0)),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.totalPageCount$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pageCount) => {
            this.changePageSelection({ totalPages: pageCount });
        });

        this.datasource$
            .pipe(
                debounceTime(50),
                map((datasource) => ({
                    totalDocuments: datasource.documents?.length || 0,
                    totalPages: datasource.documents?.reduce((acc, doc) => acc + doc.pages.length, 0) || 0,
                    documentIds: datasource.documents?.map((doc) => doc.id) || [],
                })),
                distinctUntilChanged((prev, curr) => prev.documentIds.join(',') === curr.documentIds.join(',')),
                withLatestFrom(this.viewerState$),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([{ totalDocuments, totalPages }, currentState]) => {
                const currentLayout = [UserLayoutOptions.None, UserLayoutOptions.Grid].includes(currentState.currentLayout.type)
                    ? this.viewerConfiguration.defaultLayoutType.type
                    : currentState.currentLayout.type;
                const newLayout = totalPages === 0 ? UserLayoutOptions.None : totalDocuments === 1 ? currentLayout : UserLayoutOptions.Grid;
                const newOverrideConfig = newLayout === UserLayoutOptions.Grid ? this.manipulateGridLayoutOverrides(totalPages) : undefined;

                if (
                    !isSameLayoutState({ type: newLayout, override: newOverrideConfig }, currentState.currentLayout) &&
                    newLayout !== UserLayoutOptions.None
                ) {
                    this.changeViewerLayout(newLayout, undefined, newOverrideConfig);
                }

                this.changeViewerState(
                    {
                        bestFit: true,
                        selectedToolbarItems: [ToolbarItemTypes.BestFit],
                        currentLayer: ViewerLayerType.Image,
                        currentZoomLevel: this.viewerConfiguration.defaultZoomLevel,
                        pageNavInfo: { currentPageIndex: newLayout === UserLayoutOptions.SinglePage ? 0 : undefined, totalPages },
                    },
                    EventTypes.DataSourceChanged
                );
            });

        this.userSelectedLayout$
            .pipe(withLatestFrom(this.totalPageCount$), takeUntilDestroyed(this.destroyRef))
            .subscribe(([layoutType, totalPages]) => {
                if (layoutType === UserLayoutOptions.Grid) {
                    const override = this.manipulateGridLayoutOverrides(totalPages);
                    this.changeViewerLayout(layoutType, undefined, override);
                } else {
                    this.changeViewerLayout(layoutType);
                }
            });

        this.viewerEvent$
            .pipe(
                filter((event) => event.type === EventTypes.ZoomChanged),
                distinctUntilChanged(),
                withLatestFrom(this.viewerLayout$),
                withLatestFrom(this.totalPageCount$),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(([[scaleEvent, layout], totalPages]) => {
                if (totalPages <= 0) {
                    return;
                }
                const defaultScale = this.viewerConfiguration.defaultZoomLevel;
                const newScale = (scaleEvent.data?.newValue as StateData)?.currentZoomLevel;
                const oldScale = (scaleEvent.data?.oldValue as StateData).currentZoomLevel || defaultScale;
                if (newScale === undefined || newScale === oldScale) {
                    return;
                }

                const zoomDirection = newScale - oldScale > 0 ? 1 : -1;
                if (layout.type === LayoutType.Grid) {
                    const defaultGridConfig = LayoutConfig.Grid;

                    if (newScale === defaultScale) {
                        const override = this.manipulateGridLayoutOverrides(totalPages);
                        this.changeViewerLayout(UserLayoutOptions.Grid, undefined, override);
                        return;
                    }

                    const scaleChangePercent = Math.abs((newScale - oldScale) / oldScale);
                    const scaleChangeColRowRatioFn = (x: number) => (x * scaleChangePercent) / (defaultGridConfig.columns * defaultGridConfig.rows);

                    const newRowCount = layout.rows + -zoomDirection * layout.rows * scaleChangeColRowRatioFn(defaultGridConfig.rows);
                    const newColumnCount = layout.columns + -zoomDirection * layout.columns * scaleChangeColRowRatioFn(defaultGridConfig.columns);
                    const scaledRowCount = zoomDirection > 0 ? Math.floor(newRowCount) : Math.ceil(newRowCount);
                    const scaledColumnCount = zoomDirection > 0 ? Math.floor(newColumnCount) : Math.ceil(newColumnCount);

                    if (scaledColumnCount <= 0 || scaledRowCount <= 0 || (scaledColumnCount === 1 && scaledRowCount === 1)) {
                        this.changeViewerLayout(UserLayoutOptions.Single_Vertical);
                        asapScheduler.schedule(() => {
                            this.notificationService.showInfo('VIEWER.SERVICES.VIEWER.GRID_TO_SINGLE_VERTICAL_VIEW');
                        });
                    } else {
                        this.changeViewerLayout(UserLayoutOptions.Grid, undefined, {
                            rows: scaledRowCount,
                            columns: scaledColumnCount,
                        });
                    }
                } else if (layout.type === LayoutType.SingleScrollable && zoomDirection < 0 && newScale <= defaultScale / 2) {
                    const override = this.manipulateGridLayoutOverrides(totalPages);
                    this.changeViewerLayout(UserLayoutOptions.Grid, undefined, override);
                    asapScheduler.schedule(() => {
                        this.notificationService.showInfo('VIEWER.SERVICES.VIEWER.SINGLE_VERTICAL_VIEW_TO_GRID');
                    });
                }
            });

        // reset zoom if layout type changes or selection count changes or user changes layout
        combineLatest([
            this.viewerLayout$.pipe(distinctUntilChanged((prev, curr) => prev.type === curr.type)),
            this.totalPageCount$.pipe(distinctUntilChanged()),
            this.userSelectedLayout$.pipe(distinctUntilChanged()),
        ])
            .pipe(withLatestFrom(this.viewerState$), takeUntilDestroyed(this.destroyRef))
            .subscribe(([, state]) => {
                asapScheduler.schedule(() => {
                    if (state.currentZoomLevel !== this.viewerConfiguration.defaultZoomLevel) {
                        this.changeViewerState({ currentZoomLevel: this.viewerConfiguration.defaultZoomLevel }, EventTypes.ZoomChanged);
                    }
                });
            });
    }

    updateDataSource(datasource: Datasource) {
        this.datasourceSubject$.next(datasource);
    }

    updateConfiguration(configuration: Partial<ConfigOptions>) {
        this.viewerConfiguration = { ...ConfigDefault, ...configuration };
        this.changeViewerLayout(
            this.viewerConfiguration.defaultLayoutType.type,
            this.viewerConfiguration.defaultLayoutType.availableActions,
            this.viewerConfiguration.defaultLayoutType.override,
            this.viewerConfiguration.toolbarPosition
        );
    }

    changePageSelection(change: { pageIndex?: number; totalPages?: number }) {
        this.viewerState$.pipe(take(1)).subscribe((currentState) => {
            const newTotalPages = change.totalPages ?? currentState.pageNavInfo.totalPages;
            const newPageIndex = change.pageIndex ?? currentState.pageNavInfo.currentPageIndex;

            this.changeViewerState({ pageNavInfo: { currentPageIndex: newPageIndex, totalPages: newTotalPages } }, EventTypes.PageSelected);
        });
    }

    changePageById(id: string) {
        this.datasource$.pipe(take(1)).subscribe((ds) => {
            let pageIndex = -1;
            let totalPages = 0;
            for (const doc of ds.documents) {
                if (pageIndex >= 0) {
                    continue;
                }

                const index = doc.pages.findIndex((page) => page.id === id);
                if (index >= 0) {
                    pageIndex = index;
                    totalPages = doc.pages.length;
                }
            }
            if (pageIndex >= 0) {
                this.changePageSelection({ pageIndex, totalPages });
            }
        });
    }

    changeViewerState(
        state: Partial<StateData>,
        eventType: EventTypes,
        updateDependentStateFn?: (current: StateData, newToUpdate: StateData) => StateData
    ) {
        this.viewerState$.pipe(take(1), withLatestFrom(this.datasource$)).subscribe(([currentState, datasource]) => {
            let updatedDatasource = { ...datasource };
            if (eventType === EventTypes.RotationChanged) {
                const pageId = state.currentPageId || currentState.currentPageId || '';
                const rotationDelta = state.rotationStep ?? 0;

                const updatedDocuments = datasource.documents.map((doc) => ({
                    ...doc,
                    pages: doc.pages.map((page) => ({
                        ...page,
                        viewerRotation:
                            ((page.viewerRotation ?? 0) +
                                (currentState.currentLayout.type === UserLayoutOptions.SinglePage
                                    ? page.id === pageId
                                        ? rotationDelta
                                        : 0
                                    : rotationDelta)) %
                            360,
                    })),
                }));

                if (updatedDocuments.length > 0) {
                    updatedDatasource = { ...datasource, documents: updatedDocuments };
                    this.datasourceSubject$.next(updatedDatasource);
                }
            }

            let availableActions = state.currentLayout?.availableActions ?? currentState.currentLayout.availableActions;
            if (eventType === EventTypes.LayoutChanged) {
                availableActions = undefined;
                if (state.currentLayout && state.currentLayout.type === this.viewerConfiguration.defaultLayoutType.type) {
                    availableActions = this.viewerConfiguration.defaultLayoutType.availableActions;
                }
            }

            const newState = {
                ...currentState,
                ...state,
                currentLayout: {
                    ...(state.currentLayout ?? currentState.currentLayout),
                    availableActions:
                        availableActions ?? UserLayoutOptionConfig[(state.currentLayout ?? currentState.currentLayout).type].layout.availableActions,
                },
            };

            if (updateDependentStateFn) {
                Object.assign(newState, updateDependentStateFn(currentState, newState));
            }

            this.viewerStateSubject$.next(newState);

            if (eventType !== EventTypes.PageSelected || newState.currentLayout.type === UserLayoutOptions.SinglePage) {
                asapScheduler.schedule(() => {
                    this.prepareAndEmitEvent(eventType, state, currentState, updatedDatasource);
                });
            }
        });
    }

    changeToolbarItemSelectionState(item: ToolbarItemTypes, eventType: EventTypes) {
        this.viewerState$.pipe(take(1), observeOn(asyncScheduler)).subscribe((currentState) => {
            const selectedItems = currentState.selectedToolbarItems;
            const updatedSelection = selectedItems.includes(item) ? selectedItems.filter((i) => i !== item) : [...selectedItems, item];

            this.changeViewerState({ selectedToolbarItems: updatedSelection }, eventType);
        });
    }

    changeUserSelectedLayout(layoutType: UserLayoutOptions) {
        this.userSelectedLayout$.next(layoutType);
    }

    emitViewerEvent(event: ViewerEvent<object> | EventTypes) {
        this.viewerEventSubject$.next(isInstanceOfHxIdpViewerEvent<object>(event) ? event : { type: event, timestamp: formatDate(Date.now()) });
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        this.viewerKeyboardEventSubject$.next(event);
    }

    private prepareAndEmitEvent(eventType: EventTypes, state: Partial<StateData>, currentState: StateData, datasource?: Datasource) {
        const partialCurrentStateData: any = {};
        for (const key of Object.keys(state)) {
            partialCurrentStateData[key as keyof StateData] = key in currentState ? currentState[key as keyof StateData] : undefined;
        }

        const currentPageId = state.currentPageId || currentState.currentPageId || '';
        const currentDocumentId = state.currentDocumentId || currentState.currentDocumentId || '';
        let dataSourceRef = [
            {
                documentId: currentDocumentId,
                pageId: currentPageId,
                viewerRotation: 0,
            },
        ];

        if (datasource) {
            switch (eventType) {
                case EventTypes.RotationChanged:
                case EventTypes.ZoomChanged:
                case EventTypes.ImageLoaded:
                case EventTypes.DataSourceChanged: {
                    if (
                        state.currentLayout?.type === UserLayoutOptions.SinglePage ||
                        currentState.currentLayout.type === UserLayoutOptions.SinglePage
                    ) {
                        const pageUpdate = datasource.documents
                            .find((doc) => doc.id === currentDocumentId)
                            ?.pages.find((page) => page.id === currentPageId);
                        dataSourceRef[0].viewerRotation = pageUpdate?.viewerRotation ?? 0;
                        break;
                    }
                    dataSourceRef = datasource.documents.flatMap((doc) =>
                        doc.pages.map((page) => ({
                            documentId: doc.id,
                            pageId: page.id,
                            viewerRotation: page.viewerRotation ?? 0,
                        }))
                    );
                    break;
                }
            }
        }

        this.emitViewerEvent({
            type: eventType,
            timestamp: formatDate(Date.now()),
            data: {
                oldValue: { ...partialCurrentStateData },
                newValue: { ...state },
                dataSourceRef,
            },
        });
    }

    private changeViewerLayout(
        layoutType: UserLayoutOptions,
        availableActions?: ToolbarItemTypes[],
        overrideConfig?: { rows: number; columns: number },
        toolbarPosition: ToolbarPosition = this.viewerConfiguration.toolbarPosition
    ) {
        const updatedState: Partial<StateData> = {
            currentLayout: { type: layoutType, availableActions, override: overrideConfig },
            currentToolbarPosition: toolbarPosition,
        };

        this.changeViewerState(updatedState, EventTypes.LayoutChanged, (current, newToUpdate) => {
            if (newToUpdate.currentLayout.type !== UserLayoutOptions.SinglePage) {
                newToUpdate.pageNavInfo.currentPageIndex = undefined;
            } else if (current.currentLayout.type !== UserLayoutOptions.SinglePage) {
                newToUpdate.pageNavInfo.currentPageIndex = 0;
            }
            return newToUpdate;
        });
    }

    private manipulateGridLayoutOverrides(totalPages: number) {
        const defaultGridConfig = LayoutConfig.Grid;
        const columns = Math.min(defaultGridConfig.columns, totalPages);
        const rows = Math.min(defaultGridConfig.rows, Math.ceil(totalPages / columns));
        return { rows, columns };
    }
}
