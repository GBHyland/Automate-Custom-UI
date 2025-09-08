/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { documentPageFeatureSelector } from './class-verification-root.selectors';
import { documentPageAdapter } from '../states/document-page.state';

const documentPageFeature = documentPageFeatureSelector;

export const selectDeletedPages = createSelector(documentPageAdapter.getSelectors(documentPageFeature).selectAll, (pages) => {
    return pages.filter((page) => page.markAsDeleted);
});
