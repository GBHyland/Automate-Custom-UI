/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseFilterFormType } from '../../../models/base-search-filter-form.type';
import { MultiSelectListSearchFilterValue } from './multi-select-list-search-filter.data';

export interface MultiSelectListFilterFormType extends BaseFilterFormType {
    selectedValues: MultiSelectListSearchFilterValue[];
}
