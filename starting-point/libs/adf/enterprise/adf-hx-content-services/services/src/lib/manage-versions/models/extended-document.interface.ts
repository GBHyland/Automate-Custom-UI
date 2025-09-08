/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';

export interface VersionableDocument extends Document {
    sysver_isVersion?: boolean;
    sysver_isCheckedIn?: boolean;
    sys_version?: number;
    sysver_created?: string;
    sysver_creator?: string;
    sysver_title?: string;
    sysver_description?: string;
    sysver_expires?: string;
    isCurrent?: boolean;
}
export type EditDocumentVersion = Pick<VersionableDocument, 'sys_id' | 'sysver_title' | 'sysver_description'>;
