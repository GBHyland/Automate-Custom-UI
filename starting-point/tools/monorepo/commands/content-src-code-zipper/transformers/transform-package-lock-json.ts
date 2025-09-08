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
import { readFileSync } from 'node:fs';

export interface TransformPackageLockJsonConfig {
    packageName: string;
}

export const transformPackageLockJson: FileTransformer = async (filename: string, config: TransformPackageLockJsonConfig): Promise<string> => {
    const projectMetadata = await MonorepoController.getMonorepoProjectAsync(config.packageName);

    const path = join(process.cwd(), filename);
    const packageLockJson = JSON.parse(readFileSync(path, 'utf8'));
    packageLockJson.name = config.packageName;
    packageLockJson.version = projectMetadata.releaseVersion;

    return JSON.stringify(packageLockJson, null, 2);
};
