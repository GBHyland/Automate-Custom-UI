/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CreatePluginSchema } from '../../create-plugin/schema';
import pluginGenerator from '../../create-plugin/plugin';

export const MOCK_APPLICATION_NAME = 'workspace-hxp';
export const MOCK_PLUGIN_NAME = 'my-test-plugin';
export const PLUGIN_LIBRARY_PREFIX = 'plugins';
export const MOCK_PLUGIN_FOLDER = `libs/plugins`;
export const MOCK_PLUGIN_SOURCE_FOLDER = `${PLUGIN_LIBRARY_PREFIX}/src`;
export const MOCK_PLUGIN_OPTIONS: CreatePluginSchema = {
    name: MOCK_PLUGIN_NAME,
    author: 'author',
};

export const generateMockPlugin = async (appTree: Tree, pluginOptions: CreatePluginSchema) => {
    appTree = createTreeWithInitialWorkspace(appTree);

    await pluginGenerator(appTree, pluginOptions);

    return appTree;
};

export const createTreeWithInitialWorkspace = (appTree: Tree) => {
    appTree = createTreeWithEmptyWorkspace();
    const mockTsAdfConfig = {
        extends: './tsconfig.base.json',
        compilerOptions: {
            paths: {},
        },
    };
    const mockRootAppProjectJson = {
        targets: {
            build: {
                options: {
                    assets: ['some-asset'],
                },
            },
        },
    };

    appTree.write('tsconfig.adf.json', JSON.stringify(mockTsAdfConfig));
    appTree.write('.gitignore', 'node_modules');
    appTree.write(`apps/${MOCK_APPLICATION_NAME}/project.json`, JSON.stringify(mockRootAppProjectJson));
    appTree.write(
        'libs/plugins/index.ts',
        `
    import { NgModule } from '@angular/core';

    @NgModule({
        imports: [],
    })
    export class PluginsModule {}
  `
    );

    return appTree;
};
