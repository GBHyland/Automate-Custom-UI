/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';

export const openProcessCancelConfirmationDialog = createAction(
    '[ProcessDetails] Open Process Cancel Confirmation Dialog',
    props<{
        processInstanceId: string;
        appName: string;
    }>()
);

export const cancelRunningProcess = createAction(
    '[ProcessDetails] Cancel Running process',
    props<{
        processInstanceId: string;
        appName: string;
    }>()
);
