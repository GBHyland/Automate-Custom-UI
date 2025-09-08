/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';
import { RecordStatus, RecordStatusType } from './document-retention.config';

export const isRoot = (document: Document) => !!(document?.sys_primaryType === 'SysRoot');

export const isFolder = (document: Document) => !!document?.sys_isFolderish;

export const isFile = (document: Document) => !!document?.sys_mixinTypes?.includes('SysFilish');

export const isVersionable = (document: Document) => !!document?.sys_mixinTypes?.includes('SysVersionable');

export const isVersion = (document: Document) => !!document?.['sysver_isVersion'];

export const hasBlob = (document: Document, xpath = 'sysfile_blob') => !!document?.[xpath];

export const hasRenditionBlob = (document: Document) => hasBlob(document, 'sysrendition_blob');

export const hasPermission = (document: Document, permission: string): boolean => !!document?.['sys_effectivePermissions']?.includes(permission);

export const isDocumentParentFolder = (document: Document, targetFolder: Document): boolean => document.sys_parentId === targetFolder.sys_id;

export const isGovernable = (document: Document): boolean => !!document?.sys_mixinTypes?.includes('SysGovernable');

export const isSysGovRecord = (document: Document): boolean => !!document?.['sysgov_isRecord'];

export const hasLegalHold = (document: Document): boolean => !!document?.['sysgov_hasLegalHold'];

export const getRetentionStatus = (document: Document): RecordStatusType | undefined => {
    if (!isGovernable(document) || !isSysGovRecord(document)) {
        return undefined;
    }

    if (hasLegalHold(document)) {
        return RecordStatus.OnHold;
    }

    const retainUntil = document?.['sysgov_retainUntil'];

    if (retainUntil) {
        const now = new Date();
        const retainDate = new Date(retainUntil);
        return retainDate > now ? RecordStatus.UnderRetention : RecordStatus.ReachedDisposition;
    }

    return undefined;
};
