/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey } from '../reducers/reducer';
import { ProcessServiceCloudMainState } from '../states/state';

export const selectFeature = createFeatureSelector<ProcessServiceCloudMainState>(featureKey);

export const selectApplicationName = createSelector(selectFeature, (state) => state.extension.application);

export const selectProcessManagementFilter = createSelector(selectFeature, (state) => state.extension.selectedFilter.filter);

export const selectProcessManagementFilterType = createSelector(selectFeature, (state) => state.extension.selectedFilter.type);

export const selectIfCurrentFilterCanBeRefreshed = createSelector(selectFeature, (state) => {
    return state.extension?.filtersThatCanBeRefreshed[state?.extension?.selectedFilter?.filter?.key] ? true : false;
});
