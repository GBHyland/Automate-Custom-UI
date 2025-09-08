/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree, names } from '@nx/devkit';

export interface InputOptions {
    name: string;
}

export interface DefaultPluginSchema {
    name: string;
    directory: string;
    projectName: string;
    projectRoot: string;
    projectDirectory: string;
}

export interface DefaultPluginExtensionSchema {
    pluginRootPath: string;
    pluginModulePath: string;
}

export const normalizeDefaultOptions = <T extends InputOptions>(_tree: Tree, options: T): DefaultPluginSchema & T => {
    const { fileName, className } = names(options.name);

    const projectDirectory = `plugins/${fileName}`;
    const projectName = fileName;
    const projectRoot = `libs/${projectDirectory}`;

    return {
        ...options,
        directory: projectRoot,
        moduleName: `${className}PluginModule`,
        projectName,
        projectRoot,
        projectDirectory,
    };
};
