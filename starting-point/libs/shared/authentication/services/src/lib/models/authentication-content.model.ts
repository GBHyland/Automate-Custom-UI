/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationProperties, AuthenticationType } from './authentication.types';

export class AuthenticationContent {
    id: string;
    name: string;
    authProperties: AuthenticationProperties;
    description?: string;
    key: string;

    constructor(authenticationContent: string) {
        const authenticationContentJson = JSON.parse(authenticationContent);

        this.id = authenticationContentJson?.id || '';
        this.name = authenticationContentJson?.name || '';
        this.description = authenticationContentJson?.description || '';
        this.authProperties = authenticationContentJson?.authProperties;
        this.key = authenticationContentJson?.key || '';
    }

    hasAuthProperties(): boolean {
        return !!this?.authProperties;
    }

    getAuthProperties(): AuthenticationProperties {
        return this.authProperties;
    }

    getAuthProperty(property: string): any {
        return this.authProperties[property];
    }

    hasAuthProperty(property: string): boolean {
        return !!this.authProperties[property];
    }

    getAuthType(): AuthenticationType {
        return this.authProperties?.authenticationType;
    }

    getAuthName(): string {
        return this.name || '';
    }

    getAuthKey(): string {
        return this.key || '';
    }

    getAuthDescription(): string {
        return this.description || '';
    }

    isBasicAuth(): boolean {
        return this.getAuthType() === AuthenticationType.BASIC;
    }

    isBearerAuth(): boolean {
        return this.getAuthType() === AuthenticationType.BEARER;
    }

    isClientCredentialsAuth(): boolean {
        return this.getAuthType() === AuthenticationType.CLIENT_CREDENTIALS;
    }
}
