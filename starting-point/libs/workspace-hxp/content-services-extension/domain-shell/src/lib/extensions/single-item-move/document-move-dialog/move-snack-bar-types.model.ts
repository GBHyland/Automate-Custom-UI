/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MoveStatus } from '@alfresco/adf-hx-content-services/services';
import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';

export const moveSnackBarTypes: Record<MoveStatus, DefaultStatusSnackBarIcon> = {
    [MoveStatus.SUCCESS]: 'done',
    [MoveStatus.ERROR]: 'error',
};
