/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, InputParam, ListParam, Runnable } from '../../../shared/command';
import { InvalidPasswordError, InvalidContextError, SecretManager, globalContextId } from './utils/secret-manager';
import { getConfigContexts } from '../setenv/helpers/config.helper';
import { promptPassword } from './utils/password-prompt';
import { exit } from 'node:process';

const choices = () => {
    const contexts = getConfigContexts();
    return [globalContextId, ...Object.keys(contexts)];
};

@Command({
    name: 'set',
    description: `Secret manager for the monorepo :: set secrets`,
})
export default class SetSecretCommand implements Runnable {
    @ListParam({ required: true, alias: 'c', title: 'Secret context', choices })
    context: string;

    @InputParam({ required: true, alias: 'k', title: 'Secret key' })
    key: string;

    @InputParam({ required: true, alias: 's', title: 'Secret value' })
    secret: string;

    @InputParam({ required: false, alias: 'p', title: 'Passphrase' })
    passphrase: string;

    async run(): Promise<void> {
        const passphrase = this.passphrase ?? (await promptPassword('Enter password'));

        this.key = this.key.trim();
        this.secret = this.secret.trim();

        const secretManager = new SecretManager(passphrase);
        try {
            await secretManager.load();
            await secretManager.setSecret(this.context, this.key, this.secret);
            await secretManager.persist();
            console.info('Secret set successfully.');
        } catch (error) {
            if (error instanceof InvalidPasswordError || error instanceof InvalidContextError) {
                console.error(error.message);
                exit(1);
            }
            throw error;
        }
    }
}
