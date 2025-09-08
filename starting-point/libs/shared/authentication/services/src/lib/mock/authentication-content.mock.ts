/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationContent } from '../models/authentication-content.model';

export const basicAuthenticationContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-1',
        name: 'myBasicAuth',
        key: 'myBasicAuthKey',
        description: 'my basic auth description',
        authProperties: {
            authenticationType: 'basic',
            username: 'my-username',
            password: 'my-password',
        },
    })
);

export const bearerAuthenticationContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-2',
        name: 'myBearerAuth',
        key: 'myBearerAuthKey',
        description: 'my bearer auth description',
        authProperties: {
            authenticationType: 'bearer',
            token: 'my-token',
        },
    })
);

export const clientCredentialsAuthenticationContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-3',
        name: 'myClientCredentialsAuth',
        key: 'myClientCredentialsAuthKey',
        description: 'my client credentials auth description',
        authProperties: {
            authenticationType: 'client_credentials',
            clientId: 'my-client-id',
            clientSecret: 'my-client-secret',
            endpoint: 'my-endpoint',
            scope: 'email',
        },
    })
);

export const invalidAuthenticationTypeContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-4',
        name: 'my invalid auth',
        description: 'my invalid auth description',
        authProperties: {
            authenticationType: 'invalid auth type',
        },
    })
);

export const grantTypeAuthenticationContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-5',
        name: 'myGrantTypeAuth',
        key: 'myGrantTypeAuthKey',
        description: 'my grant type auth description',
        authProperties: {
            authenticationType: 'grant_type',
            clientId: 'my-client-id',
            clientSecret: 'my-client-secret',
            endpoint: 'my-endpoint',
            scope: 'hxp.integrations',
            grantType: 'urn:hyland:params:oauth:grant-type:api-credentials',
        },
    })
);

export const smtpAuthenticationContentMock = new AuthenticationContent(
    JSON.stringify({
        id: 'authentication-id-6',
        name: 'mySmtpAuth',
        key: 'mySmtpAuthKey',
        description: 'my smtp auth description',
        authProperties: {
            authenticationType: 'smtp',
            username: 'smtp-user',
            password: 'smtp-password',
            host: 'smtp.fake.com',
            port: 587,
            fromAddress: 'my-smtp-from-address',
            fromName: 'my-smtp-from-name',
            replyToAddress: 'my-smtp-reply-to-address',
        },
    })
);
