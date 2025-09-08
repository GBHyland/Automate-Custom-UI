/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { CryptoHelper } from './crypto-helper';
import { resolve } from 'node:path';
import * as JSON5 from 'json5';

function outputJSONSync(file: string, data: any, options: { spaces?: number } = {}) {
    const jsonString = JSON.stringify(data, null, options.spaces);
    writeFileSync(file, jsonString, 'utf8');
}

export const globalContextId = 'GLOBAL';

export class InvalidPasswordError extends Error {
    constructor(public message: string) {
        super();
    }
}

export class InvalidContextError extends Error {
    constructor(public message: string) {
        super();
    }
}

export function getSecretsPath(): string {
    return resolve(process.cwd(), 'config', 'secrets.json');
}

export class SecretManager {
    private readonly secretsPath: string;
    private crypto: CryptoHelper;
    private secrets = new Map();

    static isEnabled(): boolean {
        const secretsPath = getSecretsPath();
        return existsSync(secretsPath);
    }

    constructor(passphrase: string) {
        this.secretsPath = getSecretsPath();
        this.crypto = new CryptoHelper(passphrase);
    }

    async load() {
        if (existsSync(this.secretsPath)) {
            const secrets = this.getJson(this.secretsPath);
            const entries = Object.entries(secrets);

            for (const [contextId, encryptedSecrets] of entries) {
                this.secrets.set(contextId, new Map(Object.entries(encryptedSecrets)));
            }
        }

        await this.checkPassword();
    }

    async persist() {
        const secrets = [...this.secrets.keys()].reduce((acc, contextId) => {
            acc[contextId] = Object.fromEntries(this.secrets.get(contextId) ?? []);
            return acc;
        }, {});

        outputJSONSync(this.secretsPath, secrets, { spaces: 4 });
    }

    async setSecret(contextId: string, key: string, value: string): Promise<void> {
        const encryptedValue = await this.crypto.encrypt(value);
        const contextSecrets = this.getEncryptedSecretsOfContext(contextId);
        contextSecrets.set(key, encryptedValue);
    }

    async getSecrets(contextId: string): Promise<Map<string, string>> {
        const secrets = new Map();
        const contextSecrets = this.getEncryptedSecretsOfContext(contextId);

        for (const [key, encryptedValue] of contextSecrets?.entries() ?? []) {
            try {
                const value = await this.crypto.decrypt(encryptedValue);
                secrets.set(key, value);
            } catch {
                throw new InvalidPasswordError(`Invalid password! Decryption failed for ${key} in context ${contextId}.`);
            }
        }

        return secrets;
    }

    async rotate(newPassphrase: string): Promise<void> {
        const cryptoWithNewPass = new CryptoHelper(newPassphrase);

        for (const [contextId, encryptedSecretsOfContext] of this.secrets.entries()) {
            for (const [key, encryptedSecret] of encryptedSecretsOfContext.entries()) {
                try {
                    const decryptedSecret = await this.crypto.decrypt(encryptedSecret);
                    const newEncryptedSecret = await cryptoWithNewPass.encrypt(decryptedSecret);
                    encryptedSecretsOfContext.set(key, newEncryptedSecret);
                } catch {
                    throw new InvalidPasswordError(`Invalid password! Decryption failed for ${key} in context ${contextId}.`);
                }
            }
        }
    }

    private getEncryptedSecretsOfContext(contextId: string): Map<string, string> | undefined {
        if (!this.ensureValidContextId(contextId)) {
            throw new InvalidContextError(`Invalid context "${contextId}"`);
        }

        if (!this.secrets.has(contextId)) {
            this.secrets.set(contextId, new Map());
        }

        return this.secrets.get(contextId);
    }

    private ensureValidContextId(contextId: string): boolean {
        const contextsJson = this.getContextsJson();
        const contextsKeys = Object.keys(contextsJson);

        return [globalContextId, ...contextsKeys].includes(contextId);
    }

    private async checkPassword(): Promise<void> {
        for (const contextId of this.secrets.keys()) {
            await this.getSecrets(contextId);
        }
    }

    private getJson(secretsPath: string): Record<string, any> {
        const data = readFileSync(secretsPath, 'utf8');
        return JSON.parse(data);
    }

    private getContextsJson(): Record<string, any> {
        const contextPath = resolve(process.cwd(), 'config', 'contexts.json5');
        return JSON5.parse(readFileSync(contextPath, 'utf8'));
    }
}
