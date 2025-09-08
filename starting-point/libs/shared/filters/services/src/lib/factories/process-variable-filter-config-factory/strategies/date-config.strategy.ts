/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DATE_OPTIONS, RANGE_DATE_OPTION } from '../../../filter/filter-models/date-filter.model';
import { ProcessVariableDateFilterConfig } from '../../../filter/filter-models/process-variables-filters';
import { DateFilterValue } from '../../../filter/filter.model';
import { CreateProcessVariableConfigFilterStrategy } from './base-config-strategy';
import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';

export class ProcessDateFilterConfigStrategy extends CreateProcessVariableConfigFilterStrategy<DateCloudFilterType> {
    create(): ProcessVariableDateFilterConfig {
        let dateFilterValue: DateFilterValue | null = null;
        let isVisible = false;

        if (this.alreadyCreatedFilters.length === 2 && this.alreadyCreatedFilters[0].name === this.alreadyCreatedFilters[1].name) {
            dateFilterValue = this.alreadyCreatedFilters[0]?.data === 'RANGE' ? this.createRangeFilterValue() : this.recreateFilterValue();

            isVisible = true;
        } else {
            dateFilterValue = null;
            isVisible = false;
        }

        return {
            data: {
                processDefinitionKey: this.process.key,
                variableName: this.variable.name,
                variableType: this.variable.type,
                operator: '',
            },
            description: this.description,
            options: DATE_OPTIONS,
            name: this.name,
            useTime: this.variable.type === 'datetime',
            translationKey: this.translationKey,
            value: dateFilterValue,
            visible: isVisible,
        };
    }

    private createRangeFilterValue(): DateFilterValue {
        const greaterThanFilter = this.alreadyCreatedFilters.find((filter) => filter.operator === 'gt' || filter.operator === 'gte');
        const lessThanFilter = this.alreadyCreatedFilters.find((filter) => filter.operator === 'lt' || filter.operator === 'lte');

        const greaterThanFilterValue: Date | null =
            greaterThanFilter?.value !== null && greaterThanFilter?.value !== undefined ? new Date(greaterThanFilter.value) : null;

        const lessThanFilterValue: Date | null =
            lessThanFilter?.value !== null && lessThanFilter?.value !== undefined ? new Date(lessThanFilter.value) : null;

        return {
            range: {
                from: greaterThanFilterValue,
                to: lessThanFilterValue,
            },
            selectedOption: {
                label: RANGE_DATE_OPTION.label,
                value: this.alreadyCreatedFilters[0]?.data as string,
            },
        };
    }

    private recreateFilterValue(): DateFilterValue {
        const selectedOption = this.alreadyCreatedFilters[0]?.data as string;
        const label = DATE_OPTIONS.find((option) => option.value === selectedOption)?.label ?? '';

        return {
            range: null,
            selectedOption: {
                label,
                value: selectedOption,
            },
        };
    }
}
