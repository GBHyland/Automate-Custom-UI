/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationType } from './authentication.types';
interface CommonAuthenticationFormValues {
    name: string;
    description: string;
}

export type AuthenticationDetailsFormValues =
    | BasicAuthenticationFormValues
    | BearerAuthenticationFormValues
    | ClientCredentialsAuthenticationFormValues
    | GrantTypeAuthenticationFormValues
    | SmtpAuthenticationFormValues;

export interface BasicAuthenticationFormValues extends CommonAuthenticationFormValues {
    authType: typeof AuthenticationType.BASIC;
    secured: boolean;
    credentials: [
        {
            [key: string]: BasicAuthenticationCredentials;
        }
    ];
}

export interface BearerAuthenticationFormValues extends CommonAuthenticationFormValues {
    authType: typeof AuthenticationType.BEARER;
    secured: boolean;
    credentials: [
        {
            [key: string]: BearerAuthenticationCredentials;
        }
    ];
}

export interface ClientCredentialsAuthenticationFormValues extends CommonAuthenticationFormValues {
    authType: typeof AuthenticationType.CLIENT_CREDENTIALS;
    secured: boolean;
    credentials: [
        {
            [key: string]: ClientCredentialsAuthenticationCredentials;
        }
    ];
}

export interface GrantTypeAuthenticationFormValues extends CommonAuthenticationFormValues {
    authType: typeof AuthenticationType.GRANT_TYPE;
    secured: boolean;
    credentials: [
        {
            [key: string]: GrantTypeAuthenticationCredentials;
        }
    ];
}

export interface SmtpAuthenticationFormValues extends CommonAuthenticationFormValues {
    authType: typeof AuthenticationType.SMTP;
    secured: boolean;
    credentials: [
        {
            [key: string]: SmtpAuthenticationCredentials;
        }
    ];
}

export interface BasicAuthenticationCredentials {
    username: string;
    password: string;
}

export interface BearerAuthenticationCredentials {
    token: string;
}

export interface ClientCredentialsAuthenticationCredentials {
    clientId: string;
    endpoint: string;
    clientSecret: string;
    scope: string;
}

export interface GrantTypeAuthenticationCredentials {
    clientId: string;
    endpoint: string;
    clientSecret: string;
    scope: string;
    grantType: string;
}

export interface SmtpAuthenticationCredentials {
    username: string;
    password: string;
    host: string;
    port: number;
    fromAddress: string;
    fromName: string;
    replyToAddress: string;
}

export interface AuthenticationCredentialsField {
    key: string;
    translationKey: string;
    required: boolean;
    pattern?: RegExp;
    type: 'password' | 'text' | 'number';
    hint?: string;
}
