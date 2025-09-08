/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface SecretParts {
    iv: Buffer;
    salt: Buffer;
    tag: Buffer;
    encryptedData: Buffer;
}

const ENCODING = 'base64';

export const Secret = {
    serialize(secret: SecretParts): string {
        return [
            secret.encryptedData.toString(ENCODING),
            secret.iv.toString(ENCODING),
            secret.salt.toString(ENCODING),
            secret.tag.toString(ENCODING),
        ].join('.');
    },

    deserialize(encodedValue: string): SecretParts {
        const parts = encodedValue.split('.');

        return {
            encryptedData: Buffer.from(parts[0], ENCODING),
            iv: Buffer.from(parts[1], ENCODING),
            salt: Buffer.from(parts[2], ENCODING),
            tag: Buffer.from(parts[3], ENCODING),
        };
    },
};
