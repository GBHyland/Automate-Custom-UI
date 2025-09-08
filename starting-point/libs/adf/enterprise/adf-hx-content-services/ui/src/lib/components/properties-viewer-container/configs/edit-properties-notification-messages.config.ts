/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EditPropertiesStatus } from './edit-properties-status.enum';

export const editPropertiesNotificationMessages: Record<EditPropertiesStatus, string> = {
    [EditPropertiesStatus.SUCCESS]: 'DOCUMENT.PROPERTIES.EDIT.SUCCESS',
    [EditPropertiesStatus.ERROR]: 'DOCUMENT.PROPERTIES.EDIT.ERROR',
    [EditPropertiesStatus.INFO]: 'DOCUMENT.PROPERTIES.EDIT.INFO',
};
