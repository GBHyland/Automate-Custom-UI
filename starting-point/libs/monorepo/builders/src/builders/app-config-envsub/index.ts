/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderOutput, BuilderContext, targetFromTargetString } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { EnvSetting, substituteAppConfig } from './substitute-app-config';
import { join, resolve } from 'node:path';

interface AppConfigEnvsubExecutorSchema {
    application: string;
    externalScript: string;
    projectName?: string;
    envs?: EnvSetting[];
}

export async function execute(options: AppConfigEnvsubExecutorSchema, context: BuilderContext): Promise<BuilderOutput> {
    if (!process.env.CI) {
        console.log('Skipping app.config.json substitution, as it is only needed for CI.');
        console.log('(locally either use the angular dev-server or `npm run dx lite-serve` to run the app))');
        return { success: true };
    }

    if (process.env.USE_LOCAL_FRONTEND === 'false') {
        console.log("Skipping app.config.json substitution, as it's not needed for remote testing.");
        return { success: true };
    }

    const devBuildTarget = targetFromTargetString(`${options.application}:build`);
    const { outputPath } = await context.getTargetOptions(devBuildTarget);

    let externalPath;
    if (options.externalScript) {
        const { root } = await context.getProjectMetadata(devBuildTarget);
        externalPath = join(resolve(process.cwd()), root as string, options.externalScript);
    }

    if (!outputPath) {
        throw new Error(`Cannot get outputPath of application: ${options.application}`);
    }

    await substituteAppConfig({
        application: options.application,
        projectName: options.projectName,
        externalScript: externalPath,
        distPath: outputPath.toString(),
        envs: options.envs,
    });
    return { success: true };
}

export default createBuilder<json.JsonObject & AppConfigEnvsubExecutorSchema>(execute) as any;
