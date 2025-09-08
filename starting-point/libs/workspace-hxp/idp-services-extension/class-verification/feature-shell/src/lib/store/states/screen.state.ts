/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpLoadState, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../models/common-models';
import { IdpTaskData } from '../../models/screen-models';

export interface ScreenState {
    viewFilter: IdpScreenViewFilter;
    status: IdpLoadState;
    taskContext: TaskContext;
    taskInputData: IdpTaskData | undefined;
    taskDataSynced: boolean;
    fullScreen: boolean;
    sortOption: IdpScreenViewSortOption;
}

export const initialScreenState: ScreenState = {
    viewFilter: IdpScreenViewFilter.All,
    status: IdpLoadState.NotInitialized,
    fullScreen: false,
    taskContext: {
        appName: '',
        taskId: '',
        taskName: '',
        rootProcessInstanceId: '',
        canClaimTask: false,
        canUnclaimTask: false,
    },
    taskInputData: undefined,
    taskDataSynced: false,
    sortOption: IdpScreenViewSortOption.Original,
};
