/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProcessServiceCloudMainState } from './process-service-cloud.state';

export const featureKey = 'processServicesCloud';

export const selectFeature = createFeatureSelector<ProcessServiceCloudMainState>(featureKey);

export const selectProcessManagementFilter = createSelector(selectFeature, (state) => state.extension.selectedFilter.filter);

export const selectApplicationName = createSelector(selectFeature, (state) => state.extension.application);
