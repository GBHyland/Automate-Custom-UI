/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { undoRedoFeatureSelector } from './class-verification-root.selectors';

export const selectCanUndo = createSelector(undoRedoFeatureSelector, (state) => state.undoStack.length > 0);

export const selectCanRedo = createSelector(undoRedoFeatureSelector, (state) => state.redoStack.length > 0);
