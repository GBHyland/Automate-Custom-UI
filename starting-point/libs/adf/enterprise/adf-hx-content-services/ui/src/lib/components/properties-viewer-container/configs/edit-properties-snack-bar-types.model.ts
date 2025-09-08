/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EditPropertiesStatus } from './edit-properties-status.enum';
import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';

export const editPropertiesSnackBarTypes: Record<EditPropertiesStatus, DefaultStatusSnackBarIcon> = {
    [EditPropertiesStatus.SUCCESS]: 'done',
    [EditPropertiesStatus.ERROR]: 'error',
    [EditPropertiesStatus.INFO]: 'info',
};
