/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UnitTestRunner } from '@nx/angular/generators';
import { Tree, names, offsetFromRoot, workspaceRoot } from '@nx/devkit';
import { NormalizedSchema } from '../models/normalized-schema';
import { LibraryGeneratorSchema } from '../schema';
import { join, relative } from 'node:path';
import { normalizeDirectory } from '../../../shared/generators/utils/normalize-directory';

export function normalizeOptions(tree: Tree, options: LibraryGeneratorSchema): NormalizedSchema {
    const libName = options.name ?? options.type;
    const name = names(libName).fileName;
    const directory = normalizeDirectory(options.directory || options.name);

    const projectDirectory = directory ? names(directory).fileName : name;
    const projectName = options.name || projectDirectory.replace(new RegExp('/', 'g'), '-');
    const projectRoot = relative(workspaceRoot, join(process.cwd(), projectDirectory));

    const prefix = options.prefix;
    const importPrefix = prefix && !prefix.startsWith('@') ? `@${prefix}` : prefix;
    const importPath = options.importPath || `${importPrefix}/${projectDirectory}`;

    const category = projectDirectory.split('/');
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [`scope:${projectName}`, `category:${category.length > 0 ? category[0] : prefix}`];

    const unitTestRunner = options.unitTestRunner === UnitTestRunner.None ? getUnitTestRunner(options.type) : options.unitTestRunner;

    return {
        ...options,
        directory,
        name: libName,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
        importPath,
        unitTestRunner,
        offsetFromRoot: offsetFromRoot(projectRoot),
    };
}
function getUnitTestRunner(type: string): 'karma' | 'jest' {
    return ['services', 'util', 'app-hooks'].includes(type) ? UnitTestRunner.Jest : 'karma';
}
