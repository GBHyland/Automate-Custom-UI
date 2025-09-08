/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext } from '../../context-menu-actions/actions/action-context.interface';
import { Document } from '@hylandsoftware/hxcs-js-client';

export interface PermissionChecker {
    isAvailable(context: ActionContext): boolean;
}
export type DocumentAclData = Pick<Document, 'sys_acl' | 'sys_effectiveAcl'>;
