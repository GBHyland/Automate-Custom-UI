/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    DATE_OPTIONS,
    DateFilter,
    Filter,
    ProcessVariableStringFilter,
    RadioFilter,
    RANGE_DATE_OPTION,
    StringFilter,
} from '@alfresco-dbp/shared-filters-services';

export const getRadioFilterMock = (): RadioFilter => {
    const radioFilter = new RadioFilter({
        name: 'mockRadio',
        translationKey: 'mockRadio',
        value: { value: 'mockValue1', label: 'mockLabel1', checked: true },
        options: [
            { label: 'mockLabel1', value: 'mockValue1' },
            { label: 'mockLabel2', value: 'mockValue2' },
        ],
        visible: true,
    });

    radioFilter.label = 'mockRadio';
    return radioFilter;
};

export const getDateFilterMock = (): DateFilter => {
    const dateFilter = new DateFilter({
        name: 'mockDate',
        translationKey: 'mockDate',
        value: {
            selectedOption: RANGE_DATE_OPTION,
            range: { from: new Date('2021-01-01T00:00:00.000Z'), to: new Date('2021-12-31T00:00:00.000Z') },
        },
        options: DATE_OPTIONS,
        visible: true,
    });

    dateFilter.label = 'mockDate';
    return dateFilter;
};

export const getStringFilterMock = (): StringFilter => {
    const stringFilter = new StringFilter({
        name: 'mockString',
        translationKey: 'mockString',
        value: null,
        visible: false,
    });

    stringFilter.label = 'mockString';

    return stringFilter;
};

export const getProcessStringFilterMock = (): StringFilter => {
    const processStringFilter = new ProcessVariableStringFilter({
        name: 'mockProcessString',
        translationKey: 'mockProcessString',
        description: 'mockProcessStringDescription',
        value: null,
        data: {
            processDefinitionKey: 'mockProcessDefinitionKey',
            variableName: 'mockVariableName',
            variableType: 'string',
            operator: 'equals',
        },
        visible: false,
    });

    processStringFilter.label = 'mockProcessString';

    return processStringFilter;
};

export const getAllFiltersMock = (): Filter[] => [getRadioFilterMock(), getDateFilterMock(), getStringFilterMock(), getProcessStringFilterMock()];

export const getVisibleFiltersMock = (): Filter[] => getAllFiltersMock().filter((filter) => filter.visible);

export const getHiddenFiltersMock = (): Filter[] => getAllFiltersMock().filter((filter) => !filter.visible);
