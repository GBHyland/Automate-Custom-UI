/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MonorepoController } from '@alfresco-dbp/monorepo/core';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { MissingContextVariableError, VariablesSerializer } from './variables-serializer';
import { globalContextId, type SecretManager } from '../../secrets/utils/secret-manager';
import type { GlobalVariables } from '../types';

export const GLOBAL_VARIABLES_DOT_ENV_FILE = '.env';

interface DotEnvCollection {
    [filename: string]: string[];
}

export default class DotEnvFilesHelper {
    static async writeAppDotEnvFiles(
        app2Context: Record<string, string>,
        contexts: Record<string, any>,
        secretManager?: SecretManager,
        throwOnVariableNotFound?: boolean
    ) {
        const envFiles2Content = {} as DotEnvCollection;

        for (const app of Object.keys(app2Context)) {
            const project = await MonorepoController.getMonorepoProjectAsync(app);

            const contextKey = app2Context[app];
            const context = { ...contexts[contextKey] };
            delete context.__name;

            const secrets = (await secretManager?.getSecrets(contextKey)) ?? new Map();

            const appVariablesSerializer = new VariablesSerializer(context, secrets, throwOnVariableNotFound);

            try {
                envFiles2Content[project.envFilePath] = [
                    '',
                    `# Application variables`,
                    ...appVariablesSerializer.process(project.variables, true),
                    '',
                    `# Environment secrets`,
                    ...appVariablesSerializer.process(Object.fromEntries(secrets), false),
                ];
            } catch (error: any) {
                if (error instanceof MissingContextVariableError) {
                    error.appKey = app;
                    error.contextKey = contextKey;
                }
                throw error;
            }
        }

        DotEnvFilesHelper.writeFiles(envFiles2Content);
    }

    static async writeGlobalVariablesDotEnvFiles(globalVariables: GlobalVariables, secretManager?: SecretManager) {
        const filePath = resolve(process.cwd(), GLOBAL_VARIABLES_DOT_ENV_FILE);

        const secrets = (await secretManager?.getSecrets(globalContextId)) ?? new Map();
        const globalVariablesSerializer = new VariablesSerializer();

        const envVarFileContent = Object.keys(globalVariables)
            .reduce((acc, key) => {
                acc.push(['', `# ${key}`, ...globalVariablesSerializer.process(globalVariables[key], true)]);
                return acc;
            }, [])
            .flat();

        DotEnvFilesHelper.writeFiles({
            [filePath]: [
                ...envVarFileContent,
                '',
                `# Global environment secrets`,
                ...globalVariablesSerializer.process(Object.fromEntries(secrets), false),
            ],
        });
    }

    static writeFiles(envFilesContent: DotEnvCollection) {
        for (const path of Object.keys(envFilesContent)) {
            writeFileSync(path, envFilesContent[path].join('\n'), 'utf8');
        }
    }
}
