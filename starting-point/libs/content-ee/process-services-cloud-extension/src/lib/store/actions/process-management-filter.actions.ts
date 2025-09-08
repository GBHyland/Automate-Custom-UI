/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { ProcessManagementFilterPayload } from '../states/extension.state';

export const navigateToTasks = createAction('[ProcessCloud] navigateToTasks', props<{ filterId: string }>());

export const navigateToProcesses = createAction('[ProcessCloud] navigateToProcesses', props<{ filterId: string }>());

export const navigateToFilter = createAction('[ProcessCloud] navigateToFilter', props<{ filterId: string; queryParams?: any }>());

export const setProcessManagementFilter = createAction(
    '[ProcessCloud] setProcessManagementFilter',
    props<{ payload: ProcessManagementFilterPayload }>()
);
