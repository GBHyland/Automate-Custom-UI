/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APIRequestContext, request } from '@playwright/test';
import { logger } from '../../utils/node-logger';
import { jwtDecode } from 'jwt-decode';
import { AuthFormData, CustomAPIRequest, ExtendedJwtPayload, TokenDetails, UserCredentials } from './context.models';
import { SensitiveLogger } from '../../utils';

export class ContextFactory {
    static async getContextByUser(userData: UserCredentials, context: 'BPM' | 'Identity' | 'ECM' = 'BPM'): Promise<CustomAPIRequest> {
        const { access_token } = await ContextFactory.getAuthTokenForUser(ContextFactory.getAuthFormData(userData));
        const ConfigHosts = {
            BPM: process.env.APP_CONFIG_BPM_HOST,
            ECM: process.env.APP_CONFIG_ECM_HOST,
            Identity: process.env.APP_CONFIG_IDENTITY_HOST,
        };

        return this.getContextByParameters(access_token, ConfigHosts[context], userData.username);
    }

    static async getAuthTokenForUser(authFormData: AuthFormData): Promise<TokenDetails> {
        const TOKEN_URL = process.env['APP_CONFIG_OAUTH2_TOKEN_URL'];

        SensitiveLogger.log('Playwright API', {
            ...authFormData.form,
            TOKEN_URL,
        });

        const requestContext = await request.newContext();
        const resp = await requestContext.post(TOKEN_URL, authFormData);

        if (/20\d/.test(resp.status().toString())) {
            const { access_token, expires_in } = await resp.json();
            return { access_token, expires_in };
        } else {
            const errorMessage = `Error during sending a POST request: \n
            Endpoint: ${TOKEN_URL} \n
            Params: ${JSON.stringify(ContextFactory.cleanSensitiveAuthFromData(authFormData), null, 4)}
            Error: ${JSON.stringify(await resp.json(), null, 4)}`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    static getAuthFormData(userData: UserCredentials): AuthFormData {
        return {
            form: {
                username: userData.username,
                password: userData.password,
                grant_type: 'password',
                client_id: userData.clientId,
                scope: userData.scope,
            },
        };
    }

    private static async getContextByParameters(accessToken: string, contextBaseUrl: string, username: string): Promise<CustomAPIRequest> {
        const tokenData = <ExtendedJwtPayload>jwtDecode(accessToken);
        const { exp: expires_in } = tokenData;

        const context = await request.newContext({
            baseURL: contextBaseUrl,
            extraHTTPHeaders: {
                Authorization: `Bearer ${accessToken}`,
                accept: 'application/json, text/plain, */*',
            },
        });

        return this.getCustomContextObject(context, accessToken, expires_in.toString(), username);
    }

    private static cleanSensitiveAuthFromData(authFormData: AuthFormData): AuthFormData {
        const data = { form: { ...authFormData.form } };
        if (data.form.password) {
            data.form.password = '***';
        }
        if (data.form.client_secret) {
            data.form.client_secret = '***';
        }
        return data;
    }

    private static getCustomContextObject(context: APIRequestContext, token: string, expires_in: string, username: string): CustomAPIRequest {
        const newContext = {
            token,
            expires_in: Number(expires_in),
            username,
            ...context,
        };
        return Object.setPrototypeOf(newContext, Object.getPrototypeOf(context));
    }
}
