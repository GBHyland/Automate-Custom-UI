/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { execSync } from 'node:child_process';
import { moveFile, createFolder } from './utils/fs';
import HxpLibPackager from '../../hxp-lib-packager';
import { join } from 'node:path';
import type { InRepoPackageConfig } from '../project-configs/interfaces';
import { readFileSync } from 'node:fs';

export class InRepoPackageCreator {
    async extractPackages(workspaceRoot: string, inRepoPackages: InRepoPackageConfig[]): Promise<void> {
        if (inRepoPackages.length === 0) {
            return;
        }

        const privatePackageFolderName = '.private-packages';
        const privatePackagesFolderPath = createFolder(privatePackageFolderName);

        const packageJsonPath = join(workspaceRoot, 'package.json');

        for (const inRepoPackage of inRepoPackages) {
            const packager = new HxpLibPackager();
            packager.build = inRepoPackage.lib;
            packager.publish = 'false';
            await packager.run();

            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            const createdTgzName = packageJson.dependencies[inRepoPackage.package].replace('file:', '');
            moveFile(createdTgzName, privatePackagesFolderPath);

            console.info('Updating package.json lib ' + inRepoPackage.lib);
            execSync(`npm i ${inRepoPackage.package}@file:./${privatePackageFolderName}/${createdTgzName}`);
        }
    }
}
