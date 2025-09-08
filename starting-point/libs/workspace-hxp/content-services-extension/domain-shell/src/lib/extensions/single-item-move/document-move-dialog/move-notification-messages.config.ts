/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentType, MoveStatus } from '@alfresco/adf-hx-content-services/services';

export const moveNotificationMessages: Record<MoveStatus, Record<DocumentType, string>> = {
    [MoveStatus.SUCCESS]: {
        FOLDER: 'SNACKBAR.MOVE.FOLDER_SUCCESS',
        FILE: 'SNACKBAR.MOVE.FILE_SUCCESS',
    },
    [MoveStatus.ERROR]: {
        FOLDER: 'SNACKBAR.MOVE.FOLDER_ERROR',
        FILE: 'SNACKBAR.MOVE.FILE_ERROR',
    },
};
