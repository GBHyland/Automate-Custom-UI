/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TemplateRef } from '@angular/core';
import { EventTypes } from './events';

export enum ToolbarItemTypes {
    Zoom = 'Zoom',
    Rotate = 'Rotate',
    LayoutChange = 'LayoutChange',
    FullScreen = 'FullScreen',
    BestFit = 'BestFit',
    PageNavigation = 'PageNavigation',
    ThumbnailViewer = 'ThumbnailViewer',
    LayerSelection = 'LayerSelection',
}

export enum ToolbarControlPosition {
    Start = 'start',
    Middle = 'middle',
    End = 'end',
}

export interface ToolbarItem {
    type: ToolbarItemTypes;
    icon: string;
    label: string;
    shortcutKey?: string;
    enabled: boolean;
    canStaySelected: boolean;
    selected: boolean;
    order: number;
    position: ToolbarControlPosition;
    displayType: 'button' | 'composite' | 'menu';
    eventType: EventTypes;
    subItems?: Record<string, ToolbarSubItem>;
    readonly config?: ZoomConfig | RotationConfig;
    templateRef?: TemplateRef<unknown>;
}

export type ToolbarSubItem = Pick<ToolbarItem, 'icon' | 'label' | 'shortcutKey' | 'enabled' | 'order'> & {
    id: string;
    selected?: boolean;
};

export interface ZoomConfig {
    readonly min: number;
    readonly max: number;
    readonly step: number;
}

export interface RotationConfig {
    readonly step: number;
}
