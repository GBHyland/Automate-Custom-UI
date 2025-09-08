/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { sessionFeatureSelector } from './shared-verification-root.selectors';

export const selectIsAutoNextTaskChecked = createSelector(sessionFeatureSelector, (state) => state.isAutoNextTaskChecked);
