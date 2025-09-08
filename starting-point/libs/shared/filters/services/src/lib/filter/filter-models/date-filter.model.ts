/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';
import { DateFilterValue, Filter, FilterType, Option } from '../filter.model';

export const RANGE_DATE_OPTION: Option = {
    value: DateCloudFilterType.RANGE,
    label: 'FILTERS.DATE_FILTER.RANGE',
};

export const DATE_OPTIONS: Option[] = [
    { value: DateCloudFilterType.TODAY, label: 'FILTERS.DATE_FILTER.TODAY' },
    { value: DateCloudFilterType.WEEK, label: 'FILTERS.DATE_FILTER.WEEK' },
    { value: DateCloudFilterType.MONTH, label: 'FILTERS.DATE_FILTER.MONTH' },
    { value: DateCloudFilterType.QUARTER, label: 'FILTERS.DATE_FILTER.QUARTER' },
    { value: DateCloudFilterType.YEAR, label: 'FILTERS.DATE_FILTER.YEAR' },
    RANGE_DATE_OPTION,
];

export interface DateFilterConfig {
    name: string;
    translationKey: string;
    description?: string;
    value: DateFilterValue | null;
    options: Option[];
    allowEmpty?: boolean;
    visible: boolean;
    useTime?: boolean;
}

export class DateFilter implements Filter<DateFilterValue> {
    readonly type = FilterType.DATE;

    name = '';
    translationKey = '';
    description?: string;
    label = '';
    value: DateFilterValue | null = null;
    options: Option[] = DATE_OPTIONS;
    allowEmpty = true;
    visible = false;
    useTime = false;

    constructor(config: DateFilterConfig) {
        this.name = config.name;
        this.translationKey = config.translationKey;
        this.description = config.description;
        this.value = config.value;
        this.options = config.options;
        this.allowEmpty = config.allowEmpty ?? true;
        this.visible = config.visible;
        this.useTime = config.useTime ?? false;
    }

    isValueEqualTo(other: DateFilter): boolean {
        const selectedOptionChanged = this.value?.selectedOption?.value !== other.value?.selectedOption?.value;
        const fromChanged = this.value?.range?.from?.getTime() !== other.value?.range?.from?.getTime();
        const toChanged = this.value?.range?.to?.getTime() !== other.value?.range?.to?.getTime();

        return !selectedOptionChanged && !fromChanged && !toChanged;
    }
}
