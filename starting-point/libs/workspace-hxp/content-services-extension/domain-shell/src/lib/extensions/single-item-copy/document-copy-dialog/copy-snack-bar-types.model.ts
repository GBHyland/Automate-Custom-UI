/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';
import { CopyStatus } from '@alfresco/adf-hx-content-services/services';

export const copySnackBarTypes: Record<CopyStatus, DefaultStatusSnackBarIcon> = {
    [CopyStatus.SUCCESS]: 'done',
    [CopyStatus.ERROR]: 'error',
};
