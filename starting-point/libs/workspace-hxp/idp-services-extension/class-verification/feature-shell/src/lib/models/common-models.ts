/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type IdpNavSelectionType = 'single' | 'multi' | 'multiRange' | 'none';

export const IdpScreenViewFilter = {
    All: 'All',
    OnlyIssues: 'OnlyIssues',
} as const;
export type IdpScreenViewFilter = keyof typeof IdpScreenViewFilter;

export const IdpScreenViewSortOption = {
    Classes: 'Classes',
    Original: 'Original',
} as const;
export type IdpScreenViewSortOption = typeof IdpScreenViewSortOption[keyof typeof IdpScreenViewSortOption];
