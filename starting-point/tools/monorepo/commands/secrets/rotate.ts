/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, InputParam, Runnable } from '../../../shared/command';
import { InvalidPasswordError, SecretManager } from './utils/secret-manager';
import { promptPassword } from './utils/password-prompt';

@Command({
    name: 'rotate',
    description: `Secret manager for the monorepo :: rotate master password`,
})
export default class SetSecretCommand implements Runnable {
    @InputParam({ required: false, alias: 'p', title: 'Enter current password' })
    password: string;

    @InputParam({ required: false, alias: 'n', title: 'Enter new password' })
    newPassword: string;

    async run(): Promise<void> {
        const password = this.password ?? (await promptPassword('Enter current password'));

        if (!this.newPassword) {
            this.newPassword = await promptPassword('Enter new password');
            const passwordConfirmation = await promptPassword('Confirm new password');
            if (this.newPassword !== passwordConfirmation) {
                console.error('New passwords do not match.');
                return;
            }
        }

        const secretManager = new SecretManager(password);
        try {
            await secretManager.load();
            await secretManager.rotate(this.newPassword);
            await secretManager.persist();
            console.info('Master password rotated successfully.');
        } catch (error) {
            if (error instanceof InvalidPasswordError) {
                console.error(error.message);
                return;
            }
            throw error;
        }
    }
}
