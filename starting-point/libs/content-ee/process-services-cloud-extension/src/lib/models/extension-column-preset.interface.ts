/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionElement, DataColumnType } from '@alfresco/adf-extensions';

export interface ExtensionColumnPreset extends ExtensionElement {
    key: string;
    type: DataColumnType;
    title?: string;
    subtitle?: string;
    format?: string;
    class?: string;
    sortable: boolean;
    template?: string;
    desktopOnly: boolean;
    sortingKey?: string;
    draggable?: boolean;
    isHidden?: boolean;
    customData?: any;
    dateConfig?: {
        locale?: string;
        format?: string;
        tooltipFormat?: string;
    };
}
