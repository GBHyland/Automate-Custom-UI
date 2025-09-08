/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ProcessVariableDateFilter,
    ProcessVariableDateFilterConfig,
    ProcessVariableFilterConfig,
    ProcessVariableNumberFilter,
    ProcessVariableNumberFilterConfig,
    ProcessVariableRadioFilter,
    ProcessVariableRadioFilterConfig,
    ProcessVariableStringFilter,
    ProcessVariableStringFilterConfig,
} from '../filter/filter-models/process-variables-filters';

export function createProcessVariableFilter(filterConfig: ProcessVariableFilterConfig) {
    if (filterConfig.data.variableType === 'string') {
        return new ProcessVariableStringFilter(filterConfig as ProcessVariableStringFilterConfig);
    }

    if (filterConfig.data.variableType === 'integer') {
        return new ProcessVariableNumberFilter(filterConfig as ProcessVariableNumberFilterConfig);
    }

    if (filterConfig.data.variableType === 'bigdecimal') {
        return new ProcessVariableNumberFilter(filterConfig as ProcessVariableNumberFilterConfig);
    }

    if (filterConfig.data.variableType === 'date' || filterConfig.data.variableType === 'datetime') {
        return new ProcessVariableDateFilter(filterConfig as ProcessVariableDateFilterConfig);
    }

    if (filterConfig.data.variableType === 'boolean') {
        return new ProcessVariableRadioFilter(filterConfig as ProcessVariableRadioFilterConfig);
    }

    return null;
}
