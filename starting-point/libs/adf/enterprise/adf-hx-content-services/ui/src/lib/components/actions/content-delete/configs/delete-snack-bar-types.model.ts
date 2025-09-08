/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';
import { DeletedStatus } from './deleted-status.enum';

export const deleteSnackBarTypes: Record<DeletedStatus, DefaultStatusSnackBarIcon> = {
    [DeletedStatus.REQUEST]: 'info',
    [DeletedStatus.SUCCESS]: 'done',
    [DeletedStatus.ERROR]: 'error',
};
