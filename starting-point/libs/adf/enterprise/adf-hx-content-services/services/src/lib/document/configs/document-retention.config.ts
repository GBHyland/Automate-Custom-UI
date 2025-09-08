/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const RecordStatus = {
    Incomplete: 'Incomplete',
    Ready: 'Ready',
    UnderRetention: 'UnderRetention',
    ReachedDisposition: 'ReachedDisposition',
    OnHold: 'OnHold',
} as const;

export type RecordStatusType = typeof RecordStatus[keyof typeof RecordStatus];

export const BLOCK_EDIT_STATUSES: RecordStatusType[] = [RecordStatus.OnHold, RecordStatus.UnderRetention, RecordStatus.ReachedDisposition];

export const BLOCK_DELETE_STATUSES: RecordStatusType[] = [RecordStatus.OnHold, RecordStatus.UnderRetention];
