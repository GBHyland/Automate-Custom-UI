/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClassVerificationRootState, classVerificationStateName } from '../states/root.state';

export const classVerificationRootFeatureSelector = createFeatureSelector<ClassVerificationRootState>(classVerificationStateName);

export const documentFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.documents);
export const documentPageFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.documentPages);
export const documentClassFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.documentClasses);
export const screenFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.screen);
export const screenImportingDocumentFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.screenImportingDocuments);
export const undoRedoFeatureSelector = createSelector(classVerificationRootFeatureSelector, (state) => state.undoRedo);
