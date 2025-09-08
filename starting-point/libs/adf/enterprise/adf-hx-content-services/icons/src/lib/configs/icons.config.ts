/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const DefaultIcon = {
    UNKNOWN: '',
    FOLDER: 'folder',
    OPEN_FOLDER: 'openFolder',
} as const;

export type DefaultIcon = typeof DefaultIcon[keyof typeof DefaultIcon];
