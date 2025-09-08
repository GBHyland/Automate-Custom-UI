/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const APA_FILES_TO_BE_IGNORED = [
    '**/*.tmp',
    '**/tmp',
    '**/jest.config.ts', // TODO: Needs to add it back
];

export const APA_PACKAGE_PATTERNS_TO_BE_EXCLUDED = ['@hyland', '@hylandsoftware', 'igniteui-angular', '@infragistics/igniteui-angular'];
