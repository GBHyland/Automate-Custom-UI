/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PromiseExecutor, ExecutorContext, workspaceRoot, ProjectConfiguration } from '@nx/devkit';
import { CodeownerExecutorSchema } from './schema';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface CodeownerExecutorOptions {
    json: boolean;
}

const runExecutor: PromiseExecutor<CodeownerExecutorSchema> = async (options: CodeownerExecutorOptions, context: ExecutorContext) => {
    let codeowners: string;
    let tagCodeowners = [];
    try {
        codeowners = readFileSync(join(workspaceRoot, '.github/CODEOWNERS'), 'utf-8');
        const codeownersLines = codeowners.split('\n').filter((line: string) => line.trim().length > 0 && !line.startsWith('#'));

        if (codeownersLines.length === 0) {
            console.warn('No valid CODEOWNERS entries found.');
            return { success: false };
        }
        const projectConfig = context.projectsConfigurations?.projects?.[context.projectName] as ProjectConfiguration;
        const sourceRoot = projectConfig?.sourceRoot;

        let latestUsers = '';
        for (const line of codeownersLines) {
            const parts = line.split(' ');
            const pathPattern = parts[0];
            const users = parts.slice(1).join(',');

            const regexPattern = pathPattern
                .replace(/^\//, '^') // Root anchor
                .replace(/\/$/, '/.*') // Trailing slash means all descendants
                .replace(/\*\*/g, '.*') // '**' matches any path
                .replace(/\*/g, '[^/]*'); // '*' matches any non-slash chars

            const regex = new RegExp(regexPattern);
            if (regex.test(sourceRoot)) {
                latestUsers = users;
            }
        }
        tagCodeowners = latestUsers ? [latestUsers] : [];
        if (tagCodeowners.length === 0) {
            console.warn(`project name: ${context.projectName} Project root: ${sourceRoot} `);
            return { success: false };
        }
        if (options.json) {
            console.log(JSON.stringify({ result: tagCodeowners }));
        } else {
            console.log(`${tagCodeowners.join('')}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Error reading CODEOWNERS file:', error);
        return { success: false };
    }
};

export default runExecutor;
