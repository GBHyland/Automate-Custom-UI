/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken } from '@angular/core';
import { DocumentActionService } from './document-action.service';

export const HXP_DOCUMENT_COPY_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_COPY_ACTION_SERVICE');
export const HXP_DOCUMENT_MOVE_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_MOVE_ACTION_SERVICE');
export const HXP_DOCUMENT_SHARE_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_SHARE_ACTION_SERVICE');
export const HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE = new InjectionToken<DocumentActionService>(
    'HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE'
);
export const HXP_DOCUMENT_DELETE_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_DELETE_ACTION_SERVICE');
export const HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE');
export const HXP_DOCUMENT_INFO_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_INFO_ACTION_SERVICE');
export const HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE');
export const HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE = new InjectionToken<DocumentActionService>(
    'HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE'
);
export const HXP_MANAGE_COLUMN_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_MANAGE_COLUMN_ACTION_SERVICE');
export const HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE');
export const HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE');
export const HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE = new InjectionToken<DocumentActionService>('HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE');
