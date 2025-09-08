/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/**
 * @internal
 */
export const ADF_HX_CONTENT_SERVICES_INTERNAL = {
    WORKSPACE_VERSIONING: 'workspace-versioning',
    CIC_GOVERNANCE_WORKSPACE_EXTENSION: 'cic-governance-workspace-extension',
    VERSIONING_NEW_CONTEXT_MENU: 'cic-versioning-new-context-menu',
    CIC_GOVERNANCE_WORKSPACE_LEGAL_HOLD: 'cic-governance-workspace-legal-hold',
    CIC_WORKSPACE_SATORI_APPLICATION_CHROME: 'cic-workspace-satori-application-chrome',
} as const;

export type ADF_HX_CONTENT_SERVICES_INTERNAL = typeof ADF_HX_CONTENT_SERVICES_INTERNAL[keyof typeof ADF_HX_CONTENT_SERVICES_INTERNAL];
