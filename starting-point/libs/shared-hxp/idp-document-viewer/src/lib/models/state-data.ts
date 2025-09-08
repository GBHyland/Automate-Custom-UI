/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConfigOptions, LayoutState, ToolbarPosition } from './config-options';
import { ToolbarItemTypes, ZoomConfig } from './toolbar';
import { ViewerBaseLayerType, ViewerLayerType } from './viewer-layer';

export interface StateData {
    currentZoomLevel: number;
    rotationStep: number;
    currentLayout: LayoutState;
    currentToolbarPosition: ToolbarPosition;
    currentDocumentId: string | undefined;
    currentPageId: string | undefined;
    fullscreen: boolean;
    bestFit: boolean;
    pageNavInfo: {
        currentPageIndex: number | undefined;
        totalPages: number;
    };
    currentLayer: ViewerBaseLayerType;
    selectedToolbarItems: ToolbarItemTypes[];
    defaultZoomConfig: ZoomConfig;
}

export function getDefaultStateData(config: ConfigOptions): StateData {
    return {
        currentZoomLevel: config.defaultZoomLevel,
        rotationStep: 90,
        currentLayout: config.defaultLayoutType,
        currentToolbarPosition: config.toolbarPosition,
        currentDocumentId: undefined,
        currentPageId: undefined,
        fullscreen: false,
        bestFit: true,
        pageNavInfo: {
            currentPageIndex: undefined,
            totalPages: 0,
        },
        selectedToolbarItems: [ToolbarItemTypes.BestFit],
        defaultZoomConfig: config.defaultZoomConfig,
        currentLayer: ViewerLayerType.Image,
    };
}

export function isSameLayoutState(layout1: LayoutState | undefined, layout2: LayoutState | undefined) {
    const areArraysEqual = (arr1: string[] | undefined, arr2: string[] | undefined): boolean => {
        if (!arr1 || !arr2) {
            return arr1 === arr2;
        }
        return arr1.length === arr2.length && arr1.every((item, index) => item === arr2[index]);
    };

    return (
        layout1?.type === layout2?.type &&
        layout1?.override?.rows === layout2?.override?.rows &&
        layout1?.override?.columns === layout2?.override?.columns &&
        areArraysEqual(layout1?.availableActions, layout2?.availableActions)
    );
}
