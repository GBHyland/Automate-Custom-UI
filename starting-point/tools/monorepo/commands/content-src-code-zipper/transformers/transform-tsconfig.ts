/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { join } from 'node:path';
import type { WorkspaceRelatedPackage } from '../types';
import { FileTransformer } from './file-transformer.interface';

export const transformTsConfig: FileTransformer = (filename: string, config: WorkspaceRelatedPackage[]) => {
    const tsConfig = require(join(process.cwd(), filename));

    const allTsConfigCompilerOptionPaths = Object.keys(tsConfig.compilerOptions.paths);

    // Leave only ts-config projects needed for app
    const allowedAliases = allTsConfigCompilerOptionPaths.filter((projectAlias) => filterTsConfigProjectAliases(projectAlias, config));

    // Create paths with only allowed projects
    const newPaths = allowedAliases
        .map((path) => [path, tsConfig.compilerOptions.paths[path]])
        .reduce(
            (acc, currentValue) => ({
                ...acc,
                [currentValue[0]]: currentValue[1],
            }),
            {}
        );

    tsConfig.compilerOptions.paths = newPaths;

    return JSON.stringify(tsConfig, null, 2);
};

function filterTsConfigProjectAliases(projectAlias: string, projectRelatedPackages: WorkspaceRelatedPackage[]): boolean {
    const regExps = projectRelatedPackages
        .filter((regexes) => regexes?.tsConfigRegex?.length)
        .map((regexes) => regexes.tsConfigRegex)
        .flat();

    return regExps.some((regex) => regex.test(projectAlias));
}
