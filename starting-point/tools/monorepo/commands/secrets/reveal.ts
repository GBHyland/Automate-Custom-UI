/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, InputParam, Runnable } from '../../../shared/command';
import { CryptoHelper } from './utils/crypto-helper';
import { promptPassword } from './utils/password-prompt';

const dotenv = require('dotenv');
dotenv.config();

@Command({
    name: 'reveal',
    description: `Secret manager for the monorepo :: reveal encrypted secret`,
})
export default class RevealSecretCommand implements Runnable {
    @InputParam({ required: true, alias: 'e', title: 'Encrypted value' })
    encrypted: string;

    @InputParam({ required: false, alias: 'p', title: 'Passphrase' })
    passphrase: string;

    async run(): Promise<void> {
        let passphrase = this.passphrase ?? (await promptPassword('Enter passphrase (empty for CI debug passphrase)'));

        if (!passphrase) {
            console.info('Passphrase not provided neither through CLI, nor question input, using CI_DEBUG_PASSPHRASE');
            passphrase = process.env.CI_DEBUG_PASSPHRASE;

            if (!passphrase) {
                console.error('CI_DEBUG_PASSPHRASE not set, aborting. Please setup your environment variables.');
                return;
            }
        }

        try {
            const cryptoHelper = new CryptoHelper(passphrase);
            const decrypted = await cryptoHelper.decrypt(this.encrypted);
            console.info(decrypted);
        } catch (error) {
            console.error('Error while decrypting the log message:');
            console.error(error);
        }
    }
}
