/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { formatFiles, generateFiles, names, offsetFromRoot, Tree, installPackagesTask, workspaceRoot } from '@nx/devkit';
import { join, relative } from 'node:path';
import { AlfrescoLibraryGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/angular/generators';
import { addProjectDefaults } from '../../shared/generators/utils/add-project-defaults';
import { normalizeDirectory } from '../../shared/generators/utils/normalize-directory';

interface NormalizedSchema extends AlfrescoLibraryGeneratorSchema {
    projectName: string;
    projectRoot: string;
    projectDirectory: string;
    parsedTags: string[];
    importPath: string;
}

function normalizeOptions(tree: Tree, options: AlfrescoLibraryGeneratorSchema): NormalizedSchema {
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
        template: '',
    };
    generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export default async function (tree: Tree, options: AlfrescoLibraryGeneratorSchema) {
    const normalizedOptions = normalizeOptions(tree, options);

    await libraryGenerator(tree, normalizedOptions);

    addProjectDefaults(tree, normalizedOptions);

    addFiles(tree, normalizedOptions);

    if (!normalizedOptions.skipFormat) {
        await formatFiles(tree);
    }

    return () => {
        installPackagesTask(tree);
    };
}
