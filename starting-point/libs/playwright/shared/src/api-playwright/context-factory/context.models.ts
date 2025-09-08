/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APIRequestContext } from '@playwright/test';
import { JwtPayload } from 'jwt-decode';

export interface UserCredentials {
    username: string;
    password: string;
    scope: string;
    clientId: string;
}

export interface AuthFormData {
    form: {
        username?: string;
        password?: string;
        grant_type?: string;
        client_id?: string;
        client_secret?: string;
        scope?: string;
    };
}

export interface TokenDetails {
    access_token: string;
    expires_in: string;
}

export interface CustomAPIRequest extends APIRequestContext {
    token: string;
    expires_in: Date;
    username?: string;
}

export interface ExtendedJwtPayload extends JwtPayload {
    idp: string;
    hxp_account: string;
    preferred_username: string;
    email: string;
    email_verified: boolean;
}

export interface UserContexts {
    hrUserApiContext: CustomAPIRequest;
    hrUserAcsApiContext: CustomAPIRequest;
    processAdminApiContext: CustomAPIRequest;
    modelerUserApiContext: CustomAPIRequest;
    modelerqaUserApiContext: CustomAPIRequest;
    devopsUserApiContext: CustomAPIRequest;
    analystUserApiContext: CustomAPIRequest;
    superadminApiContext: CustomAPIRequest;
    hxprAdminApiContext: CustomAPIRequest;
    salesUserApiContext: CustomAPIRequest;
    repoAdminApiContext: CustomAPIRequest;
    superadminIdentityApiContext: CustomAPIRequest;
    salesUserAcsApiContext: CustomAPIRequest;
}
