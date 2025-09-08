/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { formatFiles, generateFiles, names, readProjectConfiguration, Tree } from '@nx/devkit';
import { CreateFormWidgetSchema, NormalizedCreateFormWidgetSchema } from './schema';
import { join } from 'node:path';
import { AngularModuleAstUpdater } from '../shared/AST/module-updater';

export async function formWidgetGenerator(tree: Tree, options: CreateFormWidgetSchema) {
    const normalizedOptions = normalizeOptions(tree, options);

    generateFiles(tree, join(__dirname, 'files/templates'), normalizedOptions.formWidgetRootPath, normalizedOptions);

    addFormWidgetToPlugin(tree, normalizedOptions);

    await formatFiles(tree);
}

const normalizeOptions = (tree: Tree, options: CreateFormWidgetSchema): NormalizedCreateFormWidgetSchema => {
    const pluginConfig = readProjectConfiguration(tree, options.pluginName);
    const pluginNameWithNoPrefix = options.pluginName.replace(/^plugins-/, '');

    const pluginRootPath = pluginConfig.root;
    const pluginModulePath = `${pluginConfig.sourceRoot}/lib/${names(`${pluginNameWithNoPrefix}.module`).fileName}`;

    const formWidgetFolderName = `${names(options.formWidgetName).fileName}`;
    const formWidgetsContainerFolderName = 'form-widgets';
    const formWidgetRootPath = `${pluginConfig.sourceRoot}/lib/${formWidgetsContainerFolderName}/${formWidgetFolderName}`;
    const formWidgetPath = names(options.formWidgetName).fileName;

    if (tree.exists(formWidgetRootPath)) {
        throw new Error(`Form widget with name ${options.formWidgetName} already exists`);
    }

    const { fileName: formWidgetFileName, className: formWidgetClassName } = names(`${options.formWidgetName}.component`);

    const formWidgetSelector = `${names(pluginNameWithNoPrefix).fileName}-${names(options.formWidgetName).fileName}`;

    const { className: formWidgetModuleClassName, fileName: formWidgetModuleFileName } = names(`${options.formWidgetName}.module`);

    return {
        ...options,
        pluginRootPath,
        pluginModulePath,
        formWidgetRootPath,
        formWidgetPath,
        formWidgetFolderName,
        formWidgetsContainerFolderName,
        formWidgetFileName,
        formWidgetClassName,
        formWidgetSelector,
        formWidgetModuleClassName,
        formWidgetModuleFileName,
        formWidgetModuleFilePath: `${formWidgetRootPath}/${formWidgetModuleFileName}.ts`,
    };
};

const addFormWidgetToPlugin = (tree: Tree, options: NormalizedCreateFormWidgetSchema): void => {
    const pluginModulePathWithExtension = `${options.pluginModulePath}.ts`;
    const pluginModule = tree.read(pluginModulePathWithExtension);

    if (!pluginModule) {
        throw new Error(`Cannot find ${pluginModulePathWithExtension}`);
    }

    const updatedPluginModule = new AngularModuleAstUpdater(pluginModule.toString())
        .addNamedImport(
            options.formWidgetModuleClassName,
            `./${options.formWidgetsContainerFolderName}/${options.formWidgetFolderName}/${options.formWidgetModuleFileName}`
        )
        .addImportToModule(options.formWidgetModuleClassName)
        .getModuleAsText();

    tree.write(pluginModulePathWithExtension, updatedPluginModule);
};

export default formWidgetGenerator;
