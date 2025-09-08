/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NewPermission, PermissionLabel } from '@alfresco/adf-hx-content-services/services';

export const NewPermissionLabels: Readonly<Record<NewPermission, string>> = {
    Read: 'PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ',
    ReadWrite: 'PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ_WRITE',
    Everything: 'PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.EVERYTHING',
};

export const PermissionLabels: Readonly<Record<PermissionLabel, string>> = {
    None: 'PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.NO_ACCESS',
    Blocked: 'PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.BLOCKED',
    ...NewPermissionLabels,
};
