/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { join } from 'node:path';
import * as fs from 'node:fs';

export function moveFile(fileName: string, targetFolder: string): void {
    const sourcePath = join(process.cwd(), fileName);
    const targetPath = join(targetFolder, fileName);

    try {
        fs.renameSync(sourcePath, targetPath);
    } catch {
        // If renaming fails, it might be due to different devices, so copy and then unlink
        fs.copyFileSync(sourcePath, targetPath);
        fs.unlinkSync(sourcePath);
    }
}

export function createFolder(folderName: string | string[]): string {
    const localPackagesFolderPath = join(process.cwd(), ...(Array.isArray(folderName) ? folderName : [folderName]));
    fs.mkdirSync(localPackagesFolderPath, { recursive: true });

    return localPackagesFolderPath;
}
