/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { generateFiles, names, readProjectConfiguration, Tree, updateJson } from '@nx/devkit';
import { join } from 'node:path';
import { CreatePageSchema, NormalizedCreatePageSchema } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { ExtensionConfig } from '@alfresco/adf-extensions';
import { AngularModuleAstUpdater } from '../shared/AST/module-updater';

export const extensionInitConfig: ExtensionConfig = {
    $version: '1.0.0',
    $id: '',
    $name: '',
    $description: '',
    $vendor: '',
    $license: 'Apache-2.0',
    features: {
        navbar: [],
    },
    routes: [],
};

export async function pageGenerator(tree: Tree, options: CreatePageSchema) {
    const normalizedOptions = normalizeOptions(tree, options);
    generateFiles(tree, join(__dirname, 'files/templates'), normalizedOptions.pageRootPath, normalizedOptions);

    if (pluginHasTranslations(tree, normalizedOptions)) {
        addTranslationsToPageModule(normalizedOptions, tree);
    }

    createExtensionConfig(tree, normalizedOptions);
    addPageToPlugin(tree, normalizedOptions);

    // await formatFiles(tree);
}

const addPageToPlugin = (tree: Tree, options: NormalizedCreatePageSchema): void => {
    const pluginModulePathWithExtension = `${options.pluginModulePath}.ts`;
    const pluginModule = tree.read(pluginModulePathWithExtension);

    if (!pluginModule) {
        throw new Error(`Cannot find ${pluginModulePathWithExtension}`);
    }

    const updatedPluginModule = new AngularModuleAstUpdater(pluginModule.toString())
        .addNamedImport(options.pageModuleClassName, `./${options.pagesContainerFolderName}/${options.pageFolderName}/${options.pageModuleFileName}`)
        .addNamedImport('provideExtensionConfigValues', '@alfresco/adf-extensions')
        .addImportToModule(options.pageModuleClassName)
        .addDefaultImport(options.configVariableName, `../../configs/${options.configFileName}.json`)
        .addExtensionConfigProviderToModule(options.configVariableName, true)
        .getModuleAsText();

    tree.write(pluginModulePathWithExtension, updatedPluginModule);
};

const addTranslationsToPageModule = (options: NormalizedCreatePageSchema, tree: Tree): void => {
    const pageModule = tree.read(options.pageModuleFilePath);

    const pageModuleUpdater = new AngularModuleAstUpdater(pageModule.toString());
    const updatedPageModule = pageModuleUpdater
        .addNamedImport('TranslateModule', '@ngx-translate/core')
        .addImportToModule('TranslateModule')
        .getModuleAsText();

    tree.write(options.pageModuleFilePath, updatedPageModule);
};

const pluginHasTranslations = (tree: Tree, options: NormalizedCreatePageSchema): boolean => {
    const pluginModulePathWithExtension = `${options.pageModuleFilePath}`;
    const pluginModule = tree.read(pluginModulePathWithExtension);
    const pluginModuleUpdater = new AngularModuleAstUpdater(pluginModule.toString());
    return pluginModuleUpdater.hasNgModuleImport('TranslateModule');
};

const createExtensionConfigIfNotExist = (tree: Tree, options: NormalizedCreatePageSchema): void => {
    if (!tree.exists(`${options.configPath}.json`)) {
        extensionInitConfig.$id = options.pluginId;
        extensionInitConfig.$name = `${options.configFileName}`;
        extensionInitConfig.$description = `${options.pluginName}`;
        const defaultExtensionConfig = JSON.stringify(extensionInitConfig);

        tree.write(`${options.configPath}.json`, defaultExtensionConfig);
    }
};

export const createExtensionConfig = (tree: Tree, options: NormalizedCreatePageSchema): void => {
    createExtensionConfigIfNotExist(tree, options);

    updateJson(tree, `${options.configPath}.json`, (extensionConfiguration: ExtensionConfig) => {
        extensionConfiguration.features ??= {};
        extensionConfiguration.features.navbar ??= [];
        extensionConfiguration.routes ??= [];

        extensionConfiguration.features['navbar'].push({
            id: options.pageId,
            items: [
                {
                    id: options.menuItemId,
                    component: options.menuItemId,
                },
            ],
        });

        extensionConfiguration.routes.push({
            id: options.routeId,
            path: options.route,
            parentRoute: '',
            component: options.pageComponentId,
        });

        return extensionConfiguration;
    });
};

const normalizeOptions = (tree: Tree, options: CreatePageSchema): NormalizedCreatePageSchema => {
    const pluginConfig = readProjectConfiguration(tree, options.pluginName);

    const pluginRootPath = pluginConfig.root;
    const pluginModulePath = `${pluginConfig.sourceRoot}/lib/${names(`${options.pluginName}.module`).fileName}`;

    const pageFolderName = `${names(options.pageName).fileName}`;
    const pagesContainerFolderName = 'pages';
    const pageRootPath = `${pluginConfig.sourceRoot}/lib/${pagesContainerFolderName}/${pageFolderName}`;

    if (tree.exists(pageRootPath)) {
        throw new Error(`Page with name ${options.pageName} already exists`);
    }

    const pagePath = names(options.pageName).fileName;

    const { fileName: menuItemFileName, className: menuItemClassName } = names(`${options.pageName}-menu-item.component`);

    const { fileName: pageFileName, className: pageClassName } = names(`${options.pageName}.component`);

    const pageSelector = `${names(options.pluginName).fileName}-${names(options.pageName).fileName}`;

    const { className: pageModuleClassName, fileName: pageModuleFileName } = names(`${options.pageName}.module`);

    const configVariableName = `${names(options.pluginName).propertyName}Config`;
    const configFileName = `${names(options.pluginName).fileName}.extension.config`;
    const configPath = `${pluginRootPath}/configs/${configFileName}`;

    return {
        ...options,
        pluginId: `plugin-${names(options.pluginName).fileName}-${uuidv4()}`,
        pageId: `page-${names(options.pageName).fileName}-${uuidv4()}`,
        routeId: `page-route-${names(options.pageName).fileName}-${uuidv4()}`,
        route: names(options.pageName).fileName,
        pluginRootPath,
        pluginModulePath,
        pageRootPath,
        pagePath,
        pageFolderName,
        pagesContainerFolderName,
        pageComponentId: `page-component-${uuidv4()}`,
        pageFileName,
        pageClassName,
        pageSelector,
        menuItemId: `page-menu-item-${uuidv4()}`,
        menuItemFileName,
        menuItemClassName,
        pageModuleClassName,
        pageModuleFileName,
        pageModuleFilePath: `${pageRootPath}/${pageModuleFileName}.ts`,
        configFileName,
        configPath,
        configVariableName,
    };
};

export default pageGenerator;
