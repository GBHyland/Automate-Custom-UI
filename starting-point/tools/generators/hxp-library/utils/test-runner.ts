/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UnitTestRunner } from '@nx/angular/generators';
import { Tree, generateFiles, names, offsetFromRoot } from '@nx/devkit';
import { NormalizedSchema } from '../models/normalized-schema';
import { join } from 'node:path';

export function addUnitTestRunnerFiles(tree: Tree, options: NormalizedSchema): void {
    const filesPath = options.projectRoot;
    const templateOptions = {
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(filesPath),
        projectRoot: filesPath,
        tpl: '',
    };
    const selectedUnitTestRunner = templateOptions.unitTestRunner;

    if (selectedUnitTestRunner === UnitTestRunner.Jest || selectedUnitTestRunner === 'karma') {
        generateFiles(tree, join(__dirname, '..', 'files', selectedUnitTestRunner), filesPath, templateOptions);
    }
}
