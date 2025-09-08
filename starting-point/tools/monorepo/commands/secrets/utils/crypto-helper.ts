/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'base64';

interface SecretParts {
    iv: Buffer;
    salt: Buffer;
    tag: Buffer;
    encryptedData: Buffer;
}

export class CryptoHelper {
    constructor(private passphrase: string) {}

    private serialize(secret: SecretParts): string {
        return [
            secret.encryptedData.toString(ENCODING),
            secret.iv.toString(ENCODING),
            secret.salt.toString(ENCODING),
            secret.tag.toString(ENCODING),
        ].join('.');
    }

    private deserialize(encodedValue: string): SecretParts {
        const parts = encodedValue.split('.');

        return {
            encryptedData: Buffer.from(parts[0], ENCODING),
            iv: Buffer.from(parts[1], ENCODING),
            salt: Buffer.from(parts[2], ENCODING),
            tag: Buffer.from(parts[3], ENCODING),
        };
    }

    async encrypt(data: string): Promise<string> {
        const salt: Buffer = crypto.randomBytes(16);
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(Buffer.from(this.passphrase, 'utf8'), salt, 1000, 32, 'sha512', (err: any, derivedKey: Buffer) => {
                if (err) {
                    reject(err);
                }

                try {
                    const encryptedSecret = this.serialize({ ...this._encrypt(data, derivedKey), salt });
                    resolve(encryptedSecret);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async decrypt(encryptedSecret: string): Promise<string> {
        const { salt, ...secretParts } = this.deserialize(encryptedSecret);
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(Buffer.from(this.passphrase, 'utf8'), salt, 1000, 32, 'sha512', (err: any, derivedKey: Buffer) => {
                if (err) {
                    reject(err);
                }

                try {
                    const decryptedSecret = this._decrypt(secretParts, derivedKey);
                    resolve(decryptedSecret);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    private _encrypt(plainText: string, derivedKey: Buffer): Omit<SecretParts, 'salt'> {
        const iv: Buffer = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(derivedKey), iv);
        const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        return { iv, tag: cipher.getAuthTag(), encryptedData };
    }

    private _decrypt(secretParts: Omit<SecretParts, 'salt'>, derivedKey: Buffer): string {
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(derivedKey), secretParts.iv);
        decipher.setAuthTag(secretParts.tag);
        let str = decipher.update(secretParts.encryptedData, undefined, 'utf8');
        str += decipher.final('utf8');
        return str;
    }
}
