/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AccountApp } from '../interfaces/account-app.interface';
import { ProvisioningStatus } from '../types/provisioning-status.type';

export function filterAccountApps(accountApps: AccountApp[]) {
    return accountApps.filter((app: AccountApp) => app.provisioningStatus === ProvisioningStatus.Provisioned);
}
