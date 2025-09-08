/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DefaultPluginSchema } from '../shared/normalize-options';

// Options passed by user
export interface CreatePluginSchema {
    name: string;
    author: string;
    tags?: string;
    importPath?: string;
    addTranslations?: boolean;
}

export interface NormalizedCreatePluginSchema extends CreatePluginSchema, DefaultPluginSchema {
    applicationNames: string[];
    lowerCaseName: string;
    componentName: string;
    moduleClassName: string;
    moduleFilePath: string;
    simpleModuleName: boolean;
    standaloneConfig: boolean;
    importPath: string;
    parsedTags: string[];
    buildable: boolean;
    publishable: boolean;
    skipInstall: true;
    skipPostInstall: true;
    rootPluginsModuleFilePath: string;
    rootPluginsFileName: string;
    standalone: boolean;
}
