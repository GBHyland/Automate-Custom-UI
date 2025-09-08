/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DefaultPluginExtensionSchema } from '../shared/normalize-options';

export interface CreatePageSchema {
    pluginName: string;
    pageName: string;
    directory: string;
}

export interface NormalizedCreatePageSchema extends CreatePageSchema, DefaultPluginExtensionSchema {
    pluginId: string;
    pageId: string;
    routeId: string;
    route: string;
    pageRootPath: string;
    pagePath: string;
    pageFolderName: string;
    pageComponentId: string;
    pageFileName: string;
    pageClassName: string;
    pageSelector: string;
    pagesContainerFolderName: string;
    menuItemId: string;
    menuItemFileName: string;
    menuItemClassName: string;
    pageModuleClassName: string;
    pageModuleFileName: string;
    pageModuleFilePath: string;
    configFileName: string;
    configPath: string;
    configVariableName: string;
}
