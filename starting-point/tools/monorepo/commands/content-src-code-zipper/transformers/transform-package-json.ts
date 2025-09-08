/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { join } from 'node:path';
import { FileTransformer } from './file-transformer.interface';
import { MonorepoController } from '@alfresco-dbp/monorepo/core';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

interface PackageJsonScriptTransformer {
    transformer: (string) => string;
    script: string;
}

export interface PackageJsonTransformerData {
    packageName: string;
    packageDescription: string;
    packageJsonScripts: (string | PackageJsonScriptTransformer)[];
    packageJsonSkipDependencies: string[];
    updatePackageJsonLock: boolean; // This flag is going to update local package.json and package-lock.json
}

export const transformPackageJson: FileTransformer = async (packageJsonFileName: string, config: PackageJsonTransformerData): Promise<string> => {
    const packageJsonPath = join(process.cwd(), packageJsonFileName);
    const { commit, author, scripts, engines, dependencies, devDependencies, overrides } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const { packageJsonScripts, packageDescription, packageJsonSkipDependencies, packageName, updatePackageJsonLock } = config;

    const projectMetadata = await MonorepoController.getMonorepoProjectAsync(packageName);

    let scriptsToBeAdded = {};

    Object.keys(scripts).filter(() => {
        scriptsToBeAdded = packageJsonScripts.reduce((result, prop) => {
            if (typeof prop === 'string') {
                if (scripts[prop]) {
                    result[prop] = scripts[prop];
                }
            } else {
                if (scripts[prop.script]) {
                    const scriptCommand = scripts[prop.script];
                    result[prop.script] = prop.transformer(scriptCommand);
                }
            }

            return result;
        }, {});
    });

    const dependenciesToBeAdded = {};
    Object.keys(dependencies).filter((dependency) => {
        if (!packageJsonSkipDependencies.some((dep) => dependency.startsWith(dep))) {
            dependenciesToBeAdded[dependency] = dependencies[dependency];
        }
    });

    const devDependenciesToBeAdded = {};
    Object.keys(devDependencies).filter((devDependency) => {
        if (!packageJsonSkipDependencies.some((dep) => devDependency.startsWith(dep))) {
            devDependenciesToBeAdded[devDependency] = devDependencies[devDependency];
        }
    });

    const packageJson = JSON.stringify(
        {
            name: packageName,
            description: packageDescription,
            version: projectMetadata.releaseVersion,
            commit,
            author,
            scripts: scriptsToBeAdded,
            engines,
            dependencies: dependenciesToBeAdded,
            devDependencies: devDependenciesToBeAdded,
            overrides,
        },
        undefined,
        2
    );

    if (updatePackageJsonLock) {
        writeFileSync(packageJsonPath, packageJson);

        execSync('npm rebuild');
        execSync('npm i --package-lock-only');
    }

    return packageJson;
};
