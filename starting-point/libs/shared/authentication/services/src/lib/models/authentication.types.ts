/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type AuthenticationProperties =
    | BasicAuthenticationProperties
    | BearerAuthenticationProperties
    | ClientCredentialsAuthenticationProperties
    | GrantTypeAuthenticationProperties
    | SmtpAuthenticationProperties;

export interface BasicAuthenticationProperties {
    authenticationType: 'basic';
    username: string;
    password: string;
}

export interface BearerAuthenticationProperties {
    authenticationType: 'bearer';
    token: string;
}

export interface ClientCredentialsAuthenticationProperties {
    authenticationType: 'client_credentials';
    clientId: string;
    clientSecret: string;
    endpoint: string;
    scope: string;
}

export interface GrantTypeAuthenticationProperties {
    authenticationType: 'grant_type';
    clientId: string;
    clientSecret: string;
    endpoint: string;
    scope: string;
    grantType: string;
}

export interface SmtpAuthenticationProperties {
    authenticationType: 'smtp';
    username: string;
    password: string;
    host: string;
    port: number;
    fromAddress: string;
    fromName: string;
    replyToAddress: string;
}

export const AuthenticationType = {
    BASIC: 'basic',
    BEARER: 'bearer',
    CLIENT_CREDENTIALS: 'client_credentials',
    GRANT_TYPE: 'grant_type',
    APP_SERVICE_AUTH: 'app_service_auth',
    SMTP: 'smtp',
} as const;

export type AuthenticationType = typeof AuthenticationType[keyof typeof AuthenticationType];
