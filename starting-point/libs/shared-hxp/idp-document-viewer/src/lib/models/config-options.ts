/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserLayoutOptions } from './layout';
import { ToolbarItemTypes, ZoomConfig } from './toolbar';

export enum ToolbarPosition {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom',
}

export interface ConfigOptions {
    defaultLayoutType: LayoutState;
    defaultZoomConfig: ZoomConfig;
    defaultZoomLevel: number;
    toolbarPosition: ToolbarPosition;
}

export interface LayoutState {
    type: UserLayoutOptions;
    availableActions?: ToolbarItemTypes[];
    override?: {
        rows: number;
        columns: number;
    };
}
