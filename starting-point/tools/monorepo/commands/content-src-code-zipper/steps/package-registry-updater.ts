/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org/';

export class PackageRegistryUpdater {
    updatePackageRegistry(workspaceRoot: string, ignore: string[]): void {
        const packageLockPath = join(workspaceRoot, 'package-lock.json');
        const packageLockJson = JSON.parse(readFileSync(packageLockPath, 'utf8'));

        const packagesWithVersionFromWrongRegistry = Object.keys(packageLockJson.packages)
            .map((packageName) => [packageName.replace(/^node_modules\//, ''), packageLockJson.packages[packageName]])
            .filter(([packageName, packageData]) => this.filterIncorrectPackages(packageName, packageData, ignore))
            .map(([packageName, packageData]) => {
                return {
                    packageName,
                    packageVersion: packageData.version,
                };
            });

        if (packagesWithVersionFromWrongRegistry.length > 0) {
            console.info(
                `Packages pointed to wrong registry:\n${packagesWithVersionFromWrongRegistry
                    .map(({ packageName, packageVersion }) => `${packageName}@${packageVersion}`)
                    .join('\n')}`
            );

            // eslint-disable-next-line @cspell/spellchecker
            execSync(`npm config --userconfig .npmrc set @alfresco:registry ${DEFAULT_NPM_REGISTRY}`);

            const command = `npm install ${packagesWithVersionFromWrongRegistry
                .map(({ packageName, packageVersion }) => `${packageName}@${packageVersion}`)
                .join(' ')} --package-lock-only`;
            execSync(command, { stdio: 'inherit' });
        }
    }

    private filterIncorrectPackages(packageName: string, packageData: any, ignore: string[]) {
        const packageIsSelectedForExclusionAnyway = (nameOfPackage: string) => {
            return ignore.some((pattern) => nameOfPackage.startsWith(pattern));
        };
        const pointsToWrongRegistry = (data: any) => data.resolved?.includes('https://npm.pkg.github.com/');
        const isDependencyOfDependency = (nameOfPackage: string) => nameOfPackage.match(/node_modules/g)?.length > 0;

        return !packageIsSelectedForExclusionAnyway(packageName) && pointsToWrongRegistry(packageData) && !isDependencyOfDependency(packageName);
    }
}
