/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { RotationConfig, ToolbarItem, ToolbarItemTypes, ZoomConfig } from '../models/toolbar';
import { ToolbarConfig } from '../models/toolbar-config';
import { asyncScheduler, combineLatest, Observable } from 'rxjs';
import { ViewerService } from './viewer.service';
import { distinctUntilChanged, map, observeOn, shareReplay, take } from 'rxjs/operators';
import { isSameLayoutState, StateData } from '../models/state-data';
import { cloneDeep } from 'es-toolkit/compat';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userLayoutOptionsFromString } from '../models/layout';
import { ViewerShortcutAction, ViewerShortcutService } from './viewer-shortcut.service';
import { ViewerLayerType } from '../models/viewer-layer';

@Injectable()
export class ViewerToolbarService {
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly shortcutService: ViewerShortcutService = inject(ViewerShortcutService);
    readonly viewerToolbarItems$: Observable<ToolbarItem[]>;

    constructor() {
        this.viewerToolbarItems$ = combineLatest([
            this.viewerService.viewerLayout$.pipe(distinctUntilChanged((prev, curr) => prev.type === curr.type)),
            this.viewerService.viewerState$.pipe(
                map((state) => ({
                    currentLayout: state.currentLayout,
                    currentZoomLevel: state.currentZoomLevel,
                    pageNavInfo: state.pageNavInfo,
                    selectedToolbarItems: state.selectedToolbarItems,
                    bestFit: state.bestFit,
                    currentLayer: state.currentLayer,
                })),
                distinctUntilChanged(
                    (prev, curr) =>
                        isSameLayoutState(prev.currentLayout, curr.currentLayout) &&
                        prev.currentZoomLevel === curr.currentZoomLevel &&
                        JSON.stringify(prev.pageNavInfo) === JSON.stringify(curr.pageNavInfo) &&
                        prev.selectedToolbarItems.join(',') === curr.selectedToolbarItems.join(',') &&
                        prev.bestFit === curr.bestFit &&
                        prev.currentLayer === curr.currentLayer
                )
            ),
        ]).pipe(
            map(([layout, viewerState]) => {
                return Object.values(ToolbarConfig).map((item) => {
                    const isSelected = viewerState.selectedToolbarItems?.includes(item.type);
                    item.enabled = true;
                    const subItems = cloneDeep(item.subItems) || {};

                    for (const subItemKey in subItems) {
                        if (Object.prototype.hasOwnProperty.call(subItems, subItemKey)) {
                            const subItem = subItems[subItemKey];
                            subItem.enabled = true;
                            subItem.selected = undefined;

                            switch (item.type) {
                                case ToolbarItemTypes.LayoutChange: {
                                    subItem.selected = subItem.id === viewerState.currentLayout.type.toString();
                                    item.shortcutKey = `(${this.shortcutService.getShortcutTooltipForAction(ViewerShortcutAction.LayoutChange)})`;
                                    break;
                                }
                                case ToolbarItemTypes.Zoom: {
                                    const zoomConfig = this.viewerService.viewerConfig.defaultZoomConfig ?? (item.config as ZoomConfig);
                                    subItem.enabled =
                                        subItem.id === 'zoom_in'
                                            ? viewerState.currentZoomLevel < zoomConfig.max
                                            : viewerState.currentZoomLevel > zoomConfig.min;
                                    subItem.shortcutKey = `(${this.shortcutService.getShortcutTooltipForAction(
                                        subItem.id === 'zoom_in' ? ViewerShortcutAction.ZoomIn : ViewerShortcutAction.ZoomOut
                                    )})`;
                                    break;
                                }
                                case ToolbarItemTypes.LayerSelection: {
                                    const layerConfig = viewerState.currentLayer;
                                    subItem.selected =
                                        subItem.id === 'text' ? layerConfig === ViewerLayerType.TextOnly : layerConfig === ViewerLayerType.Image;
                                    subItem.shortcutKey = `(${this.shortcutService.getShortcutTooltipForAction(
                                        subItem.id === 'text' ? ViewerShortcutAction.Text : ViewerShortcutAction.Image
                                    )})`;
                                    break;
                                }
                                case ToolbarItemTypes.PageNavigation: {
                                    subItem.enabled =
                                        viewerState.pageNavInfo.currentPageIndex !== undefined &&
                                        (subItem.id === 'next'
                                            ? viewerState.pageNavInfo.currentPageIndex < viewerState.pageNavInfo.totalPages - 1
                                            : viewerState.pageNavInfo.currentPageIndex > 0);
                                    subItem.shortcutKey = `(${this.shortcutService.getShortcutTooltipForAction(
                                        subItem.id === 'next' ? ViewerShortcutAction.NavigateNextPage : ViewerShortcutAction.NavigatePreviousPage
                                    )})`;
                                    break;
                                }
                            }

                            if (subItem.selected) {
                                item = { ...item, icon: subItem.icon, label: subItem.label, shortcutKey: subItem.shortcutKey };
                            }
                        }
                    }

                    const shortcutActionMap: Record<ToolbarItemTypes, ViewerShortcutAction | undefined> = {
                        [ToolbarItemTypes.LayoutChange]: ViewerShortcutAction.LayoutChange,
                        [ToolbarItemTypes.ThumbnailViewer]: ViewerShortcutAction.ThumbnailViewer,
                        [ToolbarItemTypes.BestFit]: ViewerShortcutAction.BestFit,
                        [ToolbarItemTypes.Rotate]: ViewerShortcutAction.Rotate,
                        [ToolbarItemTypes.FullScreen]: ViewerShortcutAction.FullScreen,
                        [ToolbarItemTypes.Zoom]: undefined,
                        [ToolbarItemTypes.PageNavigation]: undefined,
                        [ToolbarItemTypes.LayerSelection]: undefined,
                    };

                    const actionType = shortcutActionMap[item.type];
                    if (actionType && !item.subItems) {
                        item = {
                            ...item,
                            label: item.label,
                            shortcutKey: `(${this.shortcutService.getShortcutTooltipForAction(actionType)})`,
                        };
                    }

                    if (item.type === ToolbarItemTypes.Rotate && viewerState.currentLayer === ViewerLayerType.TextOnly) {
                        item.enabled = false;
                    }

                    return {
                        ...item,
                        selected: isSelected,
                        enabled: layout && layout.availableActions.includes(item.type) && item.enabled,
                        subItems: subItems,
                    };
                });
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.viewerService.viewerKeyboardEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: KeyboardEvent) => {
            this.handleShortcutAction(event);
        });
    }

    private handleShortcutAction(event: KeyboardEvent | undefined) {
        if (!event) {
            return;
        }
        const shortcut = this.shortcutService.getShortcutForEvent(event);
        if (!shortcut) {
            return;
        }
        this.viewerToolbarItems$.pipe(take(1)).subscribe((toolbarItems) => {
            const toolbarItem = toolbarItems.find((item) => item.type === shortcut.toolbarItemType);
            if (!toolbarItem?.enabled) {
                return;
            }

            this.viewerService.viewerState$.pipe(take(1), observeOn(asyncScheduler)).subscribe((currentState) => {
                const actionConfig = toolbarItem.config;
                if (shortcut.action === ViewerShortcutAction.LayoutChange) {
                    const subitems = toolbarItem.subItems;
                    if (!subitems) {
                        return;
                    }

                    const enabledSubitems = Object.values(subitems).filter((subitem) => subitem.enabled);
                    const currentIndex = enabledSubitems.findIndex((subitem) => subitem.id === currentState.currentLayout.type.toString());
                    const nextIndex = (currentIndex + 1) % enabledSubitems.length;
                    const nextSubitem = enabledSubitems[nextIndex];

                    const layoutType = userLayoutOptionsFromString(nextSubitem.id);
                    if (layoutType) {
                        this.viewerService.changeUserSelectedLayout(layoutType);
                        return;
                    }
                }
                const updatedState = this.calculateNewActionValue(shortcut.action, currentState, actionConfig);
                if (updatedState) {
                    this.viewerService.changeViewerState(updatedState, toolbarItem.eventType);
                }
            });
        });
    }

    private calculateNewActionValue(
        action: ViewerShortcutAction,
        currentState: StateData,
        actionConfig: ZoomConfig | RotationConfig | undefined
    ): Partial<StateData> | undefined {
        switch (action) {
            case ViewerShortcutAction.ThumbnailViewer: {
                const selectedItems = currentState.selectedToolbarItems;
                const updatedSelection = selectedItems.includes(ToolbarItemTypes.ThumbnailViewer)
                    ? selectedItems.filter((i) => i !== ToolbarItemTypes.ThumbnailViewer)
                    : [...selectedItems, ToolbarItemTypes.ThumbnailViewer];
                return { selectedToolbarItems: updatedSelection };
            }
            case ViewerShortcutAction.NavigatePreviousPage: {
                return {
                    pageNavInfo: {
                        currentPageIndex:
                            this.calculateNewPageIndex(currentState.pageNavInfo.currentPageIndex, -1, currentState.pageNavInfo.totalPages) ??
                            currentState.pageNavInfo.currentPageIndex,
                        totalPages: currentState.pageNavInfo.totalPages,
                    },
                };
            }
            case ViewerShortcutAction.NavigateNextPage: {
                return {
                    pageNavInfo: {
                        currentPageIndex:
                            this.calculateNewPageIndex(currentState.pageNavInfo.currentPageIndex, 1, currentState.pageNavInfo.totalPages) ??
                            currentState.pageNavInfo.currentPageIndex,
                        totalPages: currentState.pageNavInfo.totalPages,
                    },
                };
            }
            case ViewerShortcutAction.Image: {
                return { currentLayer: ViewerLayerType.Image };
            }
            case ViewerShortcutAction.Text: {
                return { currentLayer: ViewerLayerType.TextOnly };
            }
            case ViewerShortcutAction.ZoomIn: {
                return { currentZoomLevel: this.calculateNewScale(currentState.currentZoomLevel, actionConfig as ZoomConfig, true) };
            }
            case ViewerShortcutAction.ZoomOut: {
                return { currentZoomLevel: this.calculateNewScale(currentState.currentZoomLevel, actionConfig as ZoomConfig, false) };
            }
            case ViewerShortcutAction.Rotate: {
                return { rotationStep: actionConfig?.step || 90 };
            }
            case ViewerShortcutAction.BestFit: {
                return { bestFit: !currentState.bestFit };
            }
            case ViewerShortcutAction.FullScreen: {
                return { fullscreen: !currentState.fullscreen };
            }
            default: {
                return undefined;
            }
        }
    }

    private calculateNewPageIndex(currentPageIndex: number | undefined, change: number, totalPages: number): number | undefined {
        if (currentPageIndex === undefined) {
            return undefined;
        }
        const newPageNumber = currentPageIndex + 1 + change;
        if (newPageNumber < 1 || newPageNumber > totalPages) {
            return undefined;
        }
        return newPageNumber - 1;
    }

    private calculateNewScale(currentScale: number, zoomConfig: ZoomConfig, zoomIn: boolean): number {
        const config = this.viewerService.viewerConfig.defaultZoomConfig ?? zoomConfig;
        const scaleChange = config ? (zoomIn ? config.step : -config.step) : 0;

        const divisionResult = Math.floor(currentScale / config.step);
        const newScale =
            currentScale % config.step > 0 && config.step
                ? scaleChange < 0
                    ? divisionResult * config.step
                    : (divisionResult + 1) * config.step
                : currentScale + scaleChange;

        return Math.min(Math.max(newScale, config.min), config.max);
    }
}
