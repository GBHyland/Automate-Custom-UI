/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export class CompatibilityMatrix {
    private compatibilityMatrixPath = `${process.cwd()}/docs/compatibility-matrix.md`;

    async updateCompatibilityMatrix(workspaceRoot: string) {
        const projectInfoPath = join(workspaceRoot, 'apps', 'content-ee-apa', 'project.info.json');
        const projectInfo = JSON.parse(readFileSync(projectInfoPath, 'utf8'));
        const adwReleaseVersion = projectInfo.deploy?.releaseVersion;

        const currentCompatibilityRelease = `| ${adwReleaseVersion} |\n`;
        appendFileSync(this.compatibilityMatrixPath, `${currentCompatibilityRelease}`);
    }
}
