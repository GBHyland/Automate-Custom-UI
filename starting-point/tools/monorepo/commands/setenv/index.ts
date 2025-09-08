/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, Runnable, InputParam, ConfirmParam } from '../../../shared/command';
import { InvalidPasswordError, SecretManager } from '../secrets/utils/secret-manager';
import { MonorepoController, ProjectMetadata, Json5VariantMerger } from '@alfresco-dbp/monorepo/core';
import DotEnvFilesHelper, { GLOBAL_VARIABLES_DOT_ENV_FILE } from './helpers/dotenvfile.helper';
import { SetEnvParamInquirer } from './helpers/setenv-param-inquirer';
import { intro, outro, log, note, cancel } from '@clack/prompts';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { getConfigContexts } from './helpers/config.helper';
import type { GlobalVariables } from './types';

@Command({
    name: 'setenv',
    description: `Sets the necessary environment variables based on the selected context`,
})
export default class SetEnvCommand implements Runnable {
    @InputParam({ required: false, alias: 'c', title: 'Application to context mappings as a comma separated string: <app-name>:<context-id>' })
    app2Contexts: string;

    @ConfirmParam({ required: false, alias: 'a', title: 'Whether to execute E2E tests against localhost' })
    localhostE2e: boolean;

    @ConfirmParam({ required: false, alias: 'g', title: 'Whether to write global environment variables or not' })
    global: boolean;

    @ConfirmParam({ required: false, alias: 's', title: 'Whether to write secret environment variables or not' })
    secrets: boolean;

    @InputParam({ required: false, alias: 'p', title: 'Password for unlocking encrypted secrets' })
    password: string;

    // Useful in CI to ensure all variables are set, but if some variables are still undefined, we don't want to fail for clients
    @InputParam({ required: false, alias: 't', title: 'Throw an error whenever variable is not found' })
    throwOnVariableNotFound: boolean;

    private readonly inquirer: SetEnvParamInquirer;
    private secretManager: SecretManager | undefined;

    constructor() {
        this.inquirer = new SetEnvParamInquirer();
    }

    private async getGlobalVariables(): Promise<GlobalVariables | null> {
        const configDir = resolve(process.cwd(), 'config');
        return Json5VariantMerger.read(configDir, 'global-variables', 'default');
    }

    async run() {
        console.clear();
        intro(` Environment setup `);

        const globalVariables = await this.getGlobalVariables();

        if (globalVariables) {
            if (
                this.localhostE2e === false ||
                (this.localhostE2e === undefined && (await this.inquirer.confirm(`Do you want to execute tests against remote?`)))
            ) {
                delete globalVariables.playwright['PLAYWRIGHT_E2E_HOST'];
                delete globalVariables.playwright['PLAYWRIGHT_E2E_PORT'];
            }
            if (
                this.global === true ||
                (this.global === undefined && (await this.inquirer.confirm(`Do you want to (re)set global environment variables?`)))
            ) {
                await this.ensurePasswordIsSet('global');
                await this.outputGlobalVariablesEnvFile(globalVariables);
            } else {
                log.warn(`Global environment variables have not been changed.`);
            }
        }

        const contexts = getConfigContexts();
        const app2Contexts = this.app2Contexts ? await this.parseApp2ContextFromCli(contexts) : await this.inquirer.collectApps2Context(contexts);

        if (Object.keys(app2Contexts).length > 0) {
            await this.ensurePasswordIsSet('app');
            await this.outputAppEnvFiles(app2Contexts, contexts);
        } else {
            log.warn('No application selected. No changes have been made for application related settings.');
        }

        outro(`Nice job, you are all set!`);
        exit(0);
    }

    private async ensurePasswordIsSet(type: 'global' | 'app') {
        if (
            SecretManager.isEnabled() &&
            this.secrets === undefined &&
            (await this.inquirer.confirm(`Do you want to (re)set secrets as well for ${type} environment variables?`))
        ) {
            this.secrets = true;
            this.password = await this.inquirer.password('Enter password');
        }
    }

    private async outputAppEnvFiles(app2Contexts: Record<string, string>, contexts: Record<string, any>) {
        await this.ensureSecretManager();
        await DotEnvFilesHelper.writeAppDotEnvFiles(app2Contexts, contexts, this.secretManager, this.throwOnVariableNotFound);

        const outputPaths = Object.keys(app2Contexts).map((appName) => `apps/${appName}/${ProjectMetadata.DOT_ENV_FILE}`);
        note(outputPaths.join('\n'), `App specific variables written into`);
    }

    private async outputGlobalVariablesEnvFile(globalVariables: GlobalVariables) {
        await this.ensureSecretManager();
        await DotEnvFilesHelper.writeGlobalVariablesDotEnvFiles(globalVariables, this.secretManager);
        note(GLOBAL_VARIABLES_DOT_ENV_FILE, `Global variables written into`);
    }

    private async ensureSecretManager() {
        if (this.secretManager) {
            return;
        }

        try {
            this.secretManager = this.secrets ? new SecretManager(this.password) : undefined;
            await this.secretManager?.load();
        } catch (error) {
            if (error instanceof InvalidPasswordError) {
                cancel(error.message);
                exit(1);
            }
            throw error;
        }
    }

    private async parseApp2ContextFromCli(contexts: Record<string, any>): Promise<Record<string, string>> {
        const app2ContextMap: Record<string, string> = {};
        const appContexts = this.app2Contexts.split(',');

        for (const app2Context of appContexts) {
            const [appName, contextId] = app2Context.split(':');

            if (!appName || !contextId) {
                throw new Error(`Invalid app2Context parameter: ${app2Context}`);
            }

            // Throws error if appName is not a valid monorepo project
            await MonorepoController.getMonorepoProjectAsync(appName);

            if (!contexts[contextId]) {
                throw new Error(`Invalid context id: ${contextId}`);
            }

            app2ContextMap[appName] = contextId;
        }
        return app2ContextMap;
    }
}
