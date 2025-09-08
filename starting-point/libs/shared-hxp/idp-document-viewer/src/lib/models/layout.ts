/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ToolbarItemTypes } from './toolbar';

export enum LayoutType {
    None = 'None',
    Grid = 'Grid',
    SingleScrollable = 'SingleScrollable',
    SinglePage = 'SinglePage',
}

export enum LayoutDirection {
    Horizontal = 'Horizontal',
    Vertical = 'Vertical',
    None = 'None',
}

export enum UserLayoutOptions {
    Grid = 'Grid',
    Single_Vertical = 'Single_Vertical',
    Single_Horizontal = 'Single_Horizontal',
    SinglePage = 'SinglePage',
    None = 'None',
}

export function userLayoutOptionsFromString(value: string): UserLayoutOptions {
    return UserLayoutOptions[value as keyof typeof UserLayoutOptions];
}

export interface Layout {
    readonly type: LayoutType;
    columns: number;
    rows: number;
    readonly availableActions: ToolbarItemTypes[];
    layoutDirection: LayoutDirection;
}

export const LayoutConfig: Record<LayoutType, Layout> = {
    [LayoutType.None]: {
        type: LayoutType.None,
        columns: 0,
        rows: 0,
        availableActions: [],
        layoutDirection: LayoutDirection.None,
    },
    [LayoutType.Grid]: {
        type: LayoutType.Grid,
        columns: 3,
        rows: 4,
        layoutDirection: LayoutDirection.Vertical,
        availableActions: [ToolbarItemTypes.Zoom, ToolbarItemTypes.Rotate, ToolbarItemTypes.LayoutChange, ToolbarItemTypes.FullScreen],
    },
    [LayoutType.SingleScrollable]: {
        type: LayoutType.SingleScrollable,
        columns: 1,
        rows: 1,
        layoutDirection: LayoutDirection.Vertical,
        availableActions: [ToolbarItemTypes.Zoom, ToolbarItemTypes.Rotate, ToolbarItemTypes.LayoutChange, ToolbarItemTypes.FullScreen],
    },
    [LayoutType.SinglePage]: {
        type: LayoutType.SinglePage,
        columns: 1,
        rows: 1,
        layoutDirection: LayoutDirection.None,
        availableActions: [
            ToolbarItemTypes.ThumbnailViewer,
            ToolbarItemTypes.PageNavigation,
            ToolbarItemTypes.LayerSelection,
            ToolbarItemTypes.Zoom,
            ToolbarItemTypes.Rotate,
            ToolbarItemTypes.FullScreen,
        ],
    },
};

export const UserLayoutOptionConfig: Record<UserLayoutOptions, { id: UserLayoutOptions; layout: Layout }> = {
    [UserLayoutOptions.Grid]: {
        id: UserLayoutOptions.Grid,
        layout: { ...LayoutConfig[LayoutType.Grid] },
    },
    [UserLayoutOptions.Single_Vertical]: {
        id: UserLayoutOptions.Single_Vertical,
        layout: {
            ...LayoutConfig[LayoutType.SingleScrollable],
            layoutDirection: LayoutDirection.Vertical,
        },
    },
    [UserLayoutOptions.Single_Horizontal]: {
        id: UserLayoutOptions.Single_Horizontal,
        layout: {
            ...LayoutConfig[LayoutType.SingleScrollable],
            layoutDirection: LayoutDirection.Horizontal,
        },
    },
    [UserLayoutOptions.SinglePage]: {
        id: UserLayoutOptions.SinglePage,
        layout: {
            ...LayoutConfig[LayoutType.SinglePage],
            layoutDirection: LayoutDirection.None,
        },
    },
    [UserLayoutOptions.None]: {
        id: UserLayoutOptions.None,
        layout: LayoutConfig[LayoutType.None],
    },
};

export function getAllowedActions(layoutType: UserLayoutOptions): ToolbarItemTypes[] {
    return UserLayoutOptionConfig[layoutType].layout.availableActions || [];
}

export interface LayoutInfo {
    type: LayoutType;
    columnWidthPercent: number;
    rowHeightPercent: number;
    fullViewerScreen: boolean;
    singleRowView: boolean;
    scrollDirection?: LayoutDirection;
    currentScaleFactor: number;
}
