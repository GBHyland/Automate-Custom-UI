/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FieldVerificationRootState, fieldVerificationStateName } from '../states/root.state';

export const fieldVerificationRootFeatureSelector = createFeatureSelector<FieldVerificationRootState>(fieldVerificationStateName);

export const documentFeatureSelector = createSelector(fieldVerificationRootFeatureSelector, (state) => state.document);
export const documentFieldFeatureSelector = createSelector(fieldVerificationRootFeatureSelector, (state) => state.fields);
export const documentTableFeatureSelector = createSelector(fieldVerificationRootFeatureSelector, (state) => state.tables);
export const screenFeatureSelector = createSelector(fieldVerificationRootFeatureSelector, (state) => state.screen);
// export const undoRedoFeatureSelector = createSelector(fieldVerificationRootFeatureSelector, (state) => state.undoRedo);
