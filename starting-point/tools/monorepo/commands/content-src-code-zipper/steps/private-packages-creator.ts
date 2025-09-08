/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { moveFile, createFolder } from './utils/fs';
import { readFileSync } from 'node:fs';

export class PrivatePackageCreator {
    extractPackages(workspaceRoot: string, privatePackages: string[]): void {
        if (!privatePackages || privatePackages.length === 0) {
            return;
        }

        const privatePackageFolderName = '.private-packages';
        const packageJsonPath = join(workspaceRoot, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const packageLockPath = join(workspaceRoot, 'package-lock.json');
        const packageLockJson = JSON.parse(readFileSync(packageLockPath, 'utf8'));
        const privatePackagesFolderPath = createFolder(privatePackageFolderName);

        const updatedPackageAliases: string[] = [];

        for (const privatePackage of privatePackages) {
            const createdTgzName = this.createTarballFromPackage(privatePackage, packageJson.dependencies, packageLockJson.packages);

            moveFile(createdTgzName, privatePackagesFolderPath);

            updatedPackageAliases.push(`${privatePackage}@file:./${privatePackageFolderName}/${createdTgzName}`);
        }

        console.info('Updating package.json');
        execSync(`npm i ${updatedPackageAliases.join(' ')}`);
    }

    private createTarballFromPackage(
        packageName: string,
        packageDependencies: { [packageName: string]: string },
        packageLockDependencies: {
            [key: string]: {
                version: string;
                resolved?: string;
            };
        }
    ): string {
        const privatePackageRegistry = packageDependencies[packageName];
        const currentUsedVersion = packageLockDependencies[`node_modules/${packageName}`]?.version;
        const privatePackageVersion = privatePackageRegistry ? this.forceVersion(privatePackageRegistry, currentUsedVersion) : currentUsedVersion;
        const createdPackageNameBuffer = execSync(`npm pack ${packageName}@${privatePackageVersion} --quiet`);
        const createdPackageName = createdPackageNameBuffer.toString().replace(/[\r\n]/gm, '');

        return createdPackageName;
    }

    private forceVersion(privatePackageRegistry: string, currentUsedVersion: string = 'latest'): string {
        const index = privatePackageRegistry?.lastIndexOf('@');
        return index > -1 ? privatePackageRegistry.substring(0, index + 1) + currentUsedVersion : currentUsedVersion;
    }
}
