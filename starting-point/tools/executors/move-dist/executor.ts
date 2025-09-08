/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MoveDistExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default async function runExecutor(options: MoveDistExecutorSchema, context: ExecutorContext) {
    const sourcePath = path.join(context.root, options.source);
    const destinationPath = path.join(context.root, options.destination);

    if (fs.existsSync(sourcePath)) {
        try {
            if (fs.existsSync(destinationPath)) {
                fs.rmSync(destinationPath, { recursive: true, force: true });
                // eslint-disable-next-line no-console
                console.log(`Deleted existing destination directory: ${destinationPath}`);
            }
            fs.mkdirSync(destinationPath, { recursive: true });
            // eslint-disable-next-line no-console
            console.log(`Created destination directory: ${destinationPath}`);
            // eslint-disable-next-line no-console
            console.log(`Moving files from ${sourcePath}`);

            execSync(`cp -r ${sourcePath}/* ${destinationPath}`, { stdio: 'inherit' });
            // eslint-disable-next-line no-console
            console.log(`Moved ${sourcePath} to ${destinationPath}`);
            return { success: true };
        } catch (error) {
            console.error('Error moving files:', error);
            return { success: false };
        }
    } else {
        console.error(`Source path ${sourcePath} does not exist.`);
        return { success: false };
    }
}
