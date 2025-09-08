/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExecutorContext, runExecutor, logger } from '@nx/devkit';

export default async function runCustomExecutor(options: unknown, context: ExecutorContext): Promise<{ success: boolean }> {
    logger.info(`Running custom executor for: ${context.projectName}`);
    try {
        const result = await runExecutor(
            {
                project: context.projectName,
                target: 'build-esbuild',
            },
            options,
            context
        );

        for await (const res of result) {
            if (!res.success) {
                return res;
            }
        }
        return { success: true };
    } catch (error) {
        logger.error(`Error in custom executor: ${error.message}`);
        return { success: false };
    }
}
