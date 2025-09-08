/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { formatFiles, generateFiles, names, Tree, updateJson } from '@nx/devkit';
import { CreatePluginSchema, NormalizedCreatePluginSchema } from './schema';
import { libraryGenerator } from '@nx/angular/generators';
import { normalizeDefaultOptions } from '../shared/normalize-options';
import { addProjectDefaults } from '@alfresco-dbp/tools/shared';
import { join } from 'node:path';
import { AngularModuleAstUpdater } from '../shared/AST/module-updater';

export async function pluginGenerator(tree: Tree, schema: CreatePluginSchema) {
    const options = normalizeCreatePluginOptions(tree, schema);

    await libraryGenerator(tree, options);

    generateAssetsFolder(tree, options);
    removeRedundantFiles(tree, options);
    if (options.addTranslations) {
        generateI18nFolder(options, tree);
        addTranslationsToPluginModule(options, tree);
    }

    addProjectDefaults(tree, {
        ...options,
        name: schema.name,
    });

    updateEslintConfig(tree, options);
    updatePackageJson(tree, options);
    updateRootAppProjectConfig(tree, options);

    addPluginToRootPluginsModule(tree, options);

    await formatFiles(tree);
}

const addPluginToRootPluginsModule = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    const rootPluginsModule = tree.read(options.rootPluginsModuleFilePath);
    const moduleClassName = `${options.moduleClassName}`;

    const rootPluginsModuleUpdater = new AngularModuleAstUpdater(rootPluginsModule.toString());
    const updatedRootPluginsModule = rootPluginsModuleUpdater
        .addNamedImport(moduleClassName, `./${options.name}/src/lib/${options.name}.module`)
        .addImportToModule(moduleClassName)
        .getModuleAsText();

    tree.write(options.rootPluginsModuleFilePath, updatedRootPluginsModule);
};

const updateEslintConfig = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    createEslintrcFileIfNotExists(tree, options);
    updateJson(tree, `${options.projectRoot}/.eslintrc.json`, (eslintConfig) => {
        const tsOverride = eslintConfig.overrides.find((override) => {
            return override.files.includes('*.ts');
        });

        tsOverride['parserOptions'] = {
            project: [`${options.projectRoot}/tsconfig.*?.json`],
        };

        tsOverride.rules['license-header/header'] = ['off'];

        delete tsOverride.rules['@angular-eslint/directive-selector'];
        delete tsOverride.rules['@angular-eslint/component-selector'];

        return eslintConfig;
    });
};

const createEslintrcFileIfNotExists = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    const eslintConfigPath = `${options.projectRoot}/.eslintrc.json`;
    if (!tree.exists(eslintConfigPath)) {
        const eslintFile = JSON.stringify({
            extends: ['../../../.eslintrc.json'],
            ignorePatterns: ['!**/*'],
            overrides: [
                {
                    files: ['*.ts'],
                    extends: ['plugin:@nx/angular', 'plugin:@angular-eslint/template/process-inline-templates'],
                    rules: {
                        'license-header/header': ['off'],
                    },
                    parserOptions: {
                        project: ['libs/plugins/custom-ui/tsconfig.*?.json'],
                    },
                },
                {
                    files: ['*.html'],
                    extends: ['plugin:@nx/angular-template'],
                    rules: {},
                },
            ],
        });
        tree.write(eslintConfigPath, eslintFile);
    }
};

const updatePackageJson = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    if (options.buildable) {
        updateJson(tree, `${options.projectRoot}/package.json`, (packageJson) => {
            packageJson['author'] = options.author;
            return packageJson;
        });
    }
};

const addTranslationsToPluginModule = (options: NormalizedCreatePluginSchema, tree: Tree): void => {
    const pluginModule = tree.read(options.moduleFilePath);

    const pluginModuleUpdater = new AngularModuleAstUpdater(pluginModule.toString());
    const updatedPluginModule = pluginModuleUpdater
        .addNamedImport('TranslateModule', '@ngx-translate/core')
        .addImportToModule('TranslateModule')
        .addNamedImport('provideTranslations', '@alfresco/adf-core')
        .addProviderToModule(`provideTranslations('${options.name}', 'assets/${options.name}')`)
        .getModuleAsText();

    tree.write(options.moduleFilePath, updatedPluginModule);
};

const updateRootAppProjectConfig = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    for (const applicationName of options.applicationNames) {
        updateJson(tree, `apps/${applicationName}/project.json`, (projectJson) => {
            const assets = {
                input: `${options.projectRoot}/assets`,
                output: `assets/${options.name}`,
                glob: '**/*',
            };

            projectJson.implicitDependencies ??= [];
            projectJson.implicitDependencies.push(options.projectName);

            projectJson.targets.build.options.assets.push(assets);

            return projectJson;
        });
    }
};

const generateAssetsFolder = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    generateFiles(tree, join(__dirname, 'files/templates/assets'), `${options.projectRoot}/assets`, options);
};

const generateI18nFolder = (options: NormalizedCreatePluginSchema, tree: Tree): void => {
    generateFiles(tree, join(__dirname, 'files/templates/i18n'), `${options.projectRoot}/assets/i18n`, options);
};

const removeRedundantFiles = (tree: Tree, options: NormalizedCreatePluginSchema): void => {
    tree.delete(`${options.projectRoot}/src/test-setup.ts`);
};

export const normalizeCreatePluginOptions = (tree: Tree, schema: CreatePluginSchema): NormalizedCreatePluginSchema => {
    const defaultSchema = normalizeDefaultOptions(tree, schema);

    const apps = tree.children('apps');
    const applicationFilter = new Set(['workspace-hxp', 'content-ee-apa']);
    const applicationNames = apps.filter((app) => applicationFilter.has(app));

    for (const applicationName of applicationNames) {
        if (!tree.exists(`apps/${applicationName}/project.json`)) {
            throw new Error(`Missing project.json configuration for ${applicationName}`);
        }
    }

    const parsedTags = schema.tags ? schema.tags.split(',').map((s) => s.trim()) : [];

    const importPath = schema.importPath || `@plugins/${defaultSchema.name}`;

    const { className } = names(schema.name);

    const rootPluginsFileName = 'index.ts';

    return {
        ...defaultSchema,
        applicationNames,
        rootPluginsFileName,
        rootPluginsModuleFilePath: `libs/plugins/${rootPluginsFileName}`,
        lowerCaseName: schema.name.toLowerCase(),
        componentName: `${className}Component`,
        moduleClassName: `${className}Module`,
        moduleFilePath: `${defaultSchema.directory}/src/lib/${schema.name}.module.ts`,
        simpleModuleName: true,
        parsedTags,
        importPath,
        standaloneConfig: false,
        buildable: false,
        publishable: false,
        skipInstall: true,
        skipPostInstall: true,
        standalone: false,
    };
};

export default pluginGenerator;
