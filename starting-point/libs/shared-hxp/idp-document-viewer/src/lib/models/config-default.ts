/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConfigOptions, ToolbarPosition } from './config-options';
import { UserLayoutOptions } from './layout';

export const ConfigDefault: ConfigOptions = {
    defaultLayoutType: { type: UserLayoutOptions.Single_Vertical },
    defaultZoomConfig: { min: 25, max: 300, step: 25 },
    defaultZoomLevel: 100,
    toolbarPosition: ToolbarPosition.Right,
};
