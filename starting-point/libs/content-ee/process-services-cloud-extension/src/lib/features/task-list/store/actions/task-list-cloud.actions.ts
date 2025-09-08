/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';

export const navigateToTaskDetails = createAction(
    '[Process Service Cloud Extension] navigate to task details',
    props<{ taskId: string; processName?: string }>()
);
