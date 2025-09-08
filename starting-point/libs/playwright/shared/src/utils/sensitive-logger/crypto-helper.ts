/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import crypto from 'node:crypto';
import { Secret, SecretParts } from './secret';

const ALGORITHM = 'aes-256-gcm';

export class CryptoHelper {
    constructor(private passphrase: string) {}

    encrypt(data: string): string {
        const salt: Buffer = crypto.randomBytes(16);
        const derivedKey = crypto.pbkdf2Sync(Buffer.from(this.passphrase, 'utf8'), salt, 1000, 32, 'sha512');
        return Secret.serialize({ ...this._encrypt(data, derivedKey), salt });
    }

    private _encrypt(plainText: string, derivedKey: Buffer): Omit<SecretParts, 'salt'> {
        const iv: Buffer = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(derivedKey), iv);
        const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        return { iv, tag: cipher.getAuthTag(), encryptedData };
    }
}
