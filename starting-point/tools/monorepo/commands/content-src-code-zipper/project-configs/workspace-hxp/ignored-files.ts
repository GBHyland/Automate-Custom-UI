/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const HXP_FILES_TO_BE_IGNORED = [
    '**/*.tmp',
    '**/tmp',
    '**/jest.config.ts', // TODO: Needs to add it back
    'apps/workspace-hxp/project.variables.ci.json5',
];

export const HXP_PACKAGE_PATTERNS_TO_BE_EXCLUDED = [
    '@alfresco/aca-about',
    '@alfresco/aca-content',
    '@alfresco/aca-fold',
    '@alfresco/aca-preview',
    '@alfresco/aca-viewer',
    '@alfresco/adf-office-services-ext',
    '@alfresco/aca-folder-rules',
    '@alfresco/adf-ai-extension',
    '@alfresco/microsoft-office-online-integration-extension',
    '@alfresco/adf-extensions-order-extension',
    '@alfresco/adf-governance',
    '@alfresco/adf-governance',
    '@alfresco/adf-content-services-extension',
    'igniteui-angular',
    '@infragistics/igniteui-angular',
];
