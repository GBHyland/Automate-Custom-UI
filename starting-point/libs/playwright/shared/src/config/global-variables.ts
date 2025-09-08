/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

interface User {
    username: string;
    password: string;
    scope: string;
    clientId: string;
}
export interface Users {
    superadmin: User;
    modeler: User;
    modelerqa: User;
    identity: User;
    devops: User;
    analystuser: User;
    hruser: User;
    salesuser: User;
    processadmin: User;
    manageruser: User;
    repoadmin: User;
}

export type UserType = keyof Users;

// RETRIEVING THESE VALUES NEEDS TO BE DYNAMIC,
// SINCE IT SHOULD BE CALCULATED ONLY AFTER THE ENVIRONMENT VARIABLES ARE LOADED!
const isApa = () => process.env.APP_CONFIG_OAUTH2_TOKEN_URL?.includes('alfresco') || false;
export const getTestEmailDomain = () => process.env.E2E_EMAIL_DOMAIN;
export const getUsers = (): Users => ({
    superadmin: {
        username: process.env.SUPERADMIN_EMAIL,
        password: process.env.SUPERADMIN_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_ADMIN || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    modeler: {
        username: process.env.MODELER_EMAIL,
        password: process.env.MODELER_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_MODELING || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    modelerqa: {
        username: process.env.E2E_MODELER_QA_USER,
        password: process.env.E2E_MODELER_QA_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_MODELING || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    identity: {
        username: process.env.IDENTITY_USER_EMAIL,
        password: process.env.IDENTITY_USER_PASSWORD,
        scope: process.env.APP_CONFIG_OAUTH2_SCOPE,
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    devops: {
        username: process.env.DEVOPS_EMAIL,
        password: process.env.DEVOPS_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_ADMIN || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    analystuser: {
        username: process.env.ANALYST_EMAIL,
        password: process.env.ANALYST_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_ADMIN || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    hruser: {
        username: process.env.HR_USER,
        password: process.env.HR_USER_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp groups offline_access',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_MODELING || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    salesuser: {
        username: process.env.SALES_USER,
        password: process.env.SALES_USER_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp groups offline_access',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_MODELING || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    processadmin: {
        username: process.env.PROCESS_ADMIN_EMAIL,
        password: process.env.PROCESS_ADMIN_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_ADMIN || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    manageruser: {
        username: process.env.APPLICATION_MANAGER_EMAIL,
        password: process.env.APPLICATION_MANAGER_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp offline_access groups account_authorization',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_ADMIN || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
    repoadmin: {
        username: process.env.REPOADMIN_EMAIL,
        password: process.env.REPOADMIN_PASSWORD,
        scope: isApa() ? process.env.APP_CONFIG_OAUTH2_SCOPE : 'openid profile hxp groups offline_access',
        clientId: process.env.APP_CONFIG_OAUTH2_CLIENTID_MODELING || process.env.APP_CONFIG_OAUTH2_CLIENTID,
    },
});
