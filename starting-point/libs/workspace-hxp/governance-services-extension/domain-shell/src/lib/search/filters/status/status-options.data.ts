/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordStatus, RecordStatusType } from '@alfresco/adf-hx-content-services/services';

export const STATUS_LABEL_MAP: Record<RecordStatusType, string> = {
    [RecordStatus.Incomplete]: 'Incomplete',
    [RecordStatus.Ready]: 'Ready',
    [RecordStatus.UnderRetention]: 'Under Retention',
    [RecordStatus.ReachedDisposition]: 'Reached Disposition',
    [RecordStatus.OnHold]: 'On Hold',
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABEL_MAP).map(([value, label]) => ({ label, value }));
