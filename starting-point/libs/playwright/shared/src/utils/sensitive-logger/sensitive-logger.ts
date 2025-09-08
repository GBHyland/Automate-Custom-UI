/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { styleText } from 'node:util';
import { CryptoHelper } from './crypto-helper';

const passphrase = process.env.CI_DEBUG_PASSPHRASE;
const CI = process.env.CI;

export const SensitiveLogger = {
    log(title: string, data: any) {
        try {
            if (!CI) {
                // eslint-disable-next-line no-console
                console.log(
                    `${styleText(['magenta', 'bold'], 'SENSITIVE LOGGING FOR:')} ${styleText('cyan', title)} (this would be encrypted on CI)`
                );
                // eslint-disable-next-line no-console
                console.log(data);
                return;
            }
            const cryptoHelper = new CryptoHelper(passphrase);
            const encrypted = cryptoHelper.encrypt(JSON.stringify(data, null, 2));

            // eslint-disable-next-line no-console
            console.log(`::group::${styleText(['magenta', 'bold'], 'SENSITIVE LOGGING FOR:')} ${styleText('cyan', title)}`);
            // eslint-disable-next-line no-console
            console.log(encrypted);
            // eslint-disable-next-line no-console
            console.log(`::endgroup::`);
        } catch (error) {
            console.error('Error while encrypting the log message:', error);
        }
    },
};
