/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { libraryGenerator } from '@nx/angular/generators';
import { Tree, formatFiles, workspaceRoot } from '@nx/devkit';
import { NormalizedSchema } from './models/normalized-schema';
import { LibraryGeneratorSchema } from './schema';
import { addCommonFiles } from './utils/add-common-files';
import { editLibraryProjectJson } from './utils/edit-library-project-json';
import { normalizeOptions } from './utils/normalizers';
import { addUnitTestRunnerFiles } from './utils/test-runner';
import { updateTsConfigFile } from './utils/update-ts-config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export default async function (tree: Tree, options: LibraryGeneratorSchema) {
    const normalizedOptions: NormalizedSchema = normalizeOptions(tree, options);
    const rootPackageJsonPath = join(workspaceRoot, 'package.json');
    const originalRootPackageJson = readFileSync(rootPackageJsonPath, 'utf8');

    await libraryGenerator(tree, normalizedOptions);

    editLibraryProjectJson(tree, normalizedOptions);
    addCommonFiles(tree, normalizedOptions);
    addUnitTestRunnerFiles(tree, normalizedOptions);
    updateTsConfigFile('tsconfig.adf.json', tree, normalizedOptions);

    if (!normalizedOptions.skipFormat) {
        await formatFiles(tree);
    }

    tree.write('package.json', originalRootPackageJson);

    return;
}
