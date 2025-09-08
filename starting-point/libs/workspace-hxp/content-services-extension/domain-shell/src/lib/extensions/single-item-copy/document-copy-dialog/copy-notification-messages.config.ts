/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentType, CopyStatus } from '@alfresco/adf-hx-content-services/services';

export const copyNotificationMessages: Record<CopyStatus, Record<DocumentType, string>> = {
    [CopyStatus.SUCCESS]: {
        FOLDER: 'SNACKBAR.COPY.FOLDER_SUCCESS',
        FILE: 'SNACKBAR.COPY.FILE_SUCCESS',
    },
    [CopyStatus.ERROR]: {
        FOLDER: 'SNACKBAR.COPY.FOLDER_ERROR',
        FILE: 'SNACKBAR.COPY.FILE_ERROR',
    },
};
