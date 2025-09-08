/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE,
    HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE,
    HXP_MANAGE_COLUMN_ACTION_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { DeleteButtonActionService } from './components/actions/content-delete/content-delete-button/content-delete-button-action.service';
import { ContentShareButtonActionService } from './components/actions/content-share/content-share-button/content-share-button-action.service';
import { SingleItemDownloadButtonActionService } from './components/actions/single-item-download-button/single-item-download-button-action.service';
import { PermissionsButtonActionService } from './components/permission/permission-management-button/permissions-management-button-action.service';
import { ContentPropertyViewerActionService } from './components/actions/content-properties-viewer-button/content-properties-viewer-button-action.service';
import { VersionDeleteButtonActionService } from './components/manage-versions/version-delete/version-delete-button/version-delete-button-action.service';
import { VersionEditButtonActionService } from './components/manage-versions/version-edit/version-edit-button/version-edit-button-action.service';
import { VersionRestoreActionService } from './components/manage-versions/version-restore/version-restore-action.service';
import { ManageColumnActionService } from './components/actions/manage-column/manage-column-button/manage-column-button-action.service';

export const CONTEXT_MENU_ACTIONS_PROVIDERS = [
    {
        provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
        useClass: PermissionsButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
        useClass: DeleteButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
        useClass: SingleItemDownloadButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
        useClass: ContentShareButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
        useClass: ContentPropertyViewerActionService,
    },
    {
        provide: HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE,
        useClass: VersionDeleteButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE,
        useClass: VersionEditButtonActionService,
    },
    {
        provide: HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE,
        useClass: VersionRestoreActionService,
    },
    {
        provide: HXP_MANAGE_COLUMN_ACTION_SERVICE,
        useClass: ManageColumnActionService,
    },
];
