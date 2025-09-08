/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    updateProjectConfiguration,
    readProjectConfiguration,
    formatFiles,
    generateFiles,
    names,
    offsetFromRoot,
    Tree,
    updateJson,
    installPackagesTask,
    workspaceRoot,
} from '@nx/devkit';
import * as path from 'node:path';
import { AlfrescoPlaywrightGeneratorSchema } from './schema';
import { normalizeDirectory } from '../../shared/generators/utils/normalize-directory';
import { join, relative } from 'node:path';
import { libraryGenerator } from '@nx/angular/generators';

interface NormalizedSchema extends AlfrescoPlaywrightGeneratorSchema {
    projectName: string;
    projectRoot: string;
    projectDirectory: string;
    parsedTags: string[];
    hxpAppName?: string;
}

function normalizeOptions(tree: Tree, options: AlfrescoPlaywrightGeneratorSchema): NormalizedSchema {
    const name = names(options.name).fileName;
    const directory = normalizeDirectory(options.directory || options.name);

    const projectDirectory = directory ? names(directory).fileName : name;
    const projectName = options.name || projectDirectory.split('/').join('-');
    const projectRoot = relative(workspaceRoot, join(process.cwd(), projectDirectory));
    const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : [];

    const importPath = options.importPath || name;

    return {
        ...options,
        directory,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
        importPath,
    };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
    const templateOptions = {
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
        tmpl: '',
    };
    const filesFolder = options.provideExample ? 'filesWithExample' : 'files';
    // Use workspaceRoot to resolve the absolute path to the template files
    generateFiles(tree, path.join(workspaceRoot, 'tools/generators/alfresco-playwright', filesFolder), options.projectRoot, templateOptions);
}

export default async function (tree: Tree, options: AlfrescoPlaywrightGeneratorSchema) {
    const normalizedOptions = normalizeOptions(tree, options);
    switch (normalizedOptions.appName) {
        case 'studio-apa': {
            normalizedOptions.hxpAppName = 'studio-hxp';
            break;
        }
        case 'admin-apa': {
            normalizedOptions.hxpAppName = 'admin-hxp';
            break;
        }
        case 'content-ee-apa': {
            normalizedOptions.hxpAppName = 'workspace-hxp';
            break;
        }
        default: {
            normalizedOptions.hxpAppName = normalizedOptions.appName;
        }
    }
    normalizedOptions.unitTestRunner = 'none';
    normalizedOptions.addModuleSpec = false;
    updateJson(tree, `nx.json`, (json) => {
        json.workspaceLayout = {
            libsDir: '',
        };
        return json;
    });

    await libraryGenerator(tree, normalizedOptions);
    const currentProjectConfig = readProjectConfiguration(tree, normalizedOptions.projectName);
    currentProjectConfig.root = normalizedOptions.projectRoot;
    currentProjectConfig.sourceRoot = normalizedOptions.projectRoot + '/src';

    currentProjectConfig.targets['pree2e'] = {
        executor: '@alfresco-dbp/monorepo/builders:app-config-envsub',
        options: {
            application: normalizedOptions.appName,
        },
        configurations: {
            hxp: {
                application: normalizedOptions.hxpAppName,
            },
        },
    };

    currentProjectConfig.targets['e2e'] = {
        executor: '@nx/workspace:run-commands',
        dependsOn: ['pree2e'],
        options: {
            command: `npx playwright test --config=${normalizedOptions.projectRoot}/playwright.config.ts`,
            forwardAllArgs: true,
        },
        configurations: {
            adf: {
                tsConfig: `${normalizedOptions.projectRoot}/tsconfig.adf.json`,
            },
            hxp: {
                command: `npx playwright test --config=${normalizedOptions.projectRoot}/playwright.hxp.config.ts --grep=@hxp`,
            },
        },
    };

    updateProjectConfiguration(tree, normalizedOptions.projectName, currentProjectConfig);

    tree.delete(`${normalizedOptions.projectRoot}/src/lib`);
    tree.delete(`${normalizedOptions.projectRoot}/src/index.ts`);
    tree.delete(`${normalizedOptions.projectRoot}/README.md`);
    tree.delete(`${normalizedOptions.projectRoot}/tsconfig.lib.json`);

    updateJson(tree, `nx.json`, (json) => {
        delete json.workspaceLayout;
        return json;
    });

    updateJson(tree, 'project-target.json', (json) => {
        const nameWithoutPrefix = normalizedOptions.projectName.replace('e2es-', '');
        json.projects[`${nameWithoutPrefix}`] = normalizedOptions.projectDirectory;
        delete json.projects[`${normalizedOptions.projectName}`];
        return json;
    });

    updateJson(tree, `tsconfig.base.json`, (json) => {
        delete json.compilerOptions.paths[`${normalizedOptions.importPath}`];
        return json;
    });

    const eslintrcPath = `${normalizedOptions.projectRoot}/.eslintrc.json`;
    updateJson(tree, eslintrcPath, (json) => {
        json.overrides[0].rules = {
            '@alfresco/eslint-angular/no-angular-material-selectors': 'error',
        };
        json.overrides[0].parserOptions = {
            project: `${normalizedOptions.projectRoot}/tsconfig.*?.json`,
        };
        delete json.overrides[0].extends;
        json.overrides.splice(1, 1);
        return json;
    });

    const tsconfigPath = `${normalizedOptions.projectRoot}/tsconfig.json`;
    updateJson(tree, tsconfigPath, (json) => {
        delete json.references;
        delete json.angularCompilerOptions;
        return json;
    });

    addFiles(tree, normalizedOptions);
    if (!normalizedOptions.skipFormat) {
        await formatFiles(tree);
    }

    return () => {
        installPackagesTask(tree);
    };
}
