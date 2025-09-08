/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DefaultPluginExtensionSchema } from '../shared/normalize-options';

export interface CreateFormWidgetSchema {
    pluginName: string;
    formWidgetName: string;
}

export interface NormalizedCreateFormWidgetSchema extends CreateFormWidgetSchema, DefaultPluginExtensionSchema {
    formWidgetRootPath: string;
    formWidgetPath: string;
    formWidgetFolderName: string;
    formWidgetFileName: string;
    formWidgetClassName: string;
    formWidgetSelector: string;
    formWidgetsContainerFolderName: string;
    formWidgetModuleClassName: string;
    formWidgetModuleFileName: string;
    formWidgetModuleFilePath: string;
}
