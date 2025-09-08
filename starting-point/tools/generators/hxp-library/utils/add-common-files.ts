/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree, generateFiles, names } from '@nx/devkit';
import { NormalizedSchema } from '../models/normalized-schema';
import { join } from 'node:path';

export function addCommonFiles(tree: Tree, options: NormalizedSchema) {
    const templateOptions = {
        ...options,
        ...names(options.name),
        tpl: '',
    };
    const filesPath = options.projectRoot;

    generateFiles(tree, join(__dirname, '..', 'files', 'common'), filesPath, templateOptions);
    if (!options.routing) {
        tree.delete(join(filesPath, 'src', 'lib', 'lib.routes.ts'));
    }
    tree.delete(join(filesPath, 'README.md'));
}
