/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateFilter, RANGE_DATE_OPTION, DATE_OPTIONS } from '../filter-models/date-filter.model';
import { RadioFilter } from '../filter-models/radio-filter.model';
import { StringFilter } from '../filter-models/string-filter.model';
import { Filter } from '../filter.model';

export const RADIO_FILTER_MOCK: Filter = new RadioFilter({
    name: 'mockRadio',
    translationKey: 'mockRadio',
    value: { value: 'mockValue1', label: 'mockLabel1', checked: true },
    options: [
        { label: 'mockLabel1', value: 'mockValue1' },
        { label: 'mockLabel2', value: 'mockValue2' },
    ],
    visible: true,
});

export const DATE_FILTER_MOCK: Filter = new DateFilter({
    name: 'mockDate',
    translationKey: 'mockDate',
    value: {
        selectedOption: RANGE_DATE_OPTION,
        range: { from: new Date('2021-01-01T00:00:00.000Z'), to: new Date('2021-12-31T00:00:00.000Z') },
    },
    options: DATE_OPTIONS,
    visible: true,
});

export const STRING_FILTER_MOCK: Filter = new StringFilter({
    name: 'mockString',
    translationKey: 'mockString',
    value: null,
    visible: false,
});

export const ALL_FILTERS_MOCK: Filter[] = [RADIO_FILTER_MOCK, DATE_FILTER_MOCK, STRING_FILTER_MOCK];

export const VISIBLE_FILTERS_MOCK = ALL_FILTERS_MOCK.filter((filter) => filter.visible);

export const HIDDEN_FILTERS_MOCK = ALL_FILTERS_MOCK.filter((filter) => !filter.visible);
