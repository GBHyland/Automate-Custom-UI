/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree, updateJson, getWorkspaceLayout } from '@nx/devkit';

export type ProjectDefaults = DefaultTargetsOptions & UpdateAdfConfigOptions;

export interface DefaultTargetsOptions {
    name: string;
    directory: string;
    projectRoot: string;
}

export interface UpdateAdfConfigOptions {
    name: string;
    importPath: string;
    projectDirectory: string;
}

export const addProjectDefaults = (tree: Tree, options: ProjectDefaults): void => {
    addDefaultProjectTargets(tree, options);
    updateAdfConfig(tree, options);
};

export const addDefaultProjectTargets = (tree: Tree, options: DefaultTargetsOptions): void => {
    const { projectRoot } = options;

    updateJson(tree, `${projectRoot}/project.json`, (currentProjectConfig) => {
        currentProjectConfig.targets['stylelint'] = {};
        return currentProjectConfig;
    });
};

export const updateAdfConfig = (tree: Tree, options: UpdateAdfConfigOptions): void => {
    updateJson(tree, 'tsconfig.adf.json', (json) => {
        const c = json.compilerOptions;
        c.paths = c.paths || {};
        delete c.paths[options.name];

        if (c.paths[options.importPath]) {
            throw new Error(`A library using the import path "${options.importPath}" already exists. Make sure to specify a unique import path.`);
        }

        c.paths[options.importPath] = [`${getWorkspaceLayout(tree).libsDir}/${options.projectDirectory}/src/index.ts`];

        return json;
    });
};
