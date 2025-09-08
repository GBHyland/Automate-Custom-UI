/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DownloadStatus } from '../models/download-status.enum';

export const downloadNotificationMessages: Record<DownloadStatus, string> = {
    [DownloadStatus.REQUEST]: 'DOWNLOAD_STATUS.SNACKBAR.REQUEST',
    [DownloadStatus.SUCCESS]: 'DOWNLOAD_STATUS.SNACKBAR.SUCCESS',
    [DownloadStatus.ERROR]: 'DOWNLOAD_STATUS.SNACKBAR.ERROR',
};
