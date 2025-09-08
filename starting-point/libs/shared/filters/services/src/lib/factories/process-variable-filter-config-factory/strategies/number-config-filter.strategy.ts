/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessVariableNumberFilterConfig } from '../../../filter/filter-models/process-variables-filters';
import { NumberFilterOperatorType } from '../../../filter/filter.model';
import { mapProcessFilterOperatorToNumberOperator } from '../../mappers';
import { CreateProcessVariableConfigFilterStrategy } from './base-config-strategy';

export class ProcessNumberFilterConfigStrategy extends CreateProcessVariableConfigFilterStrategy {
    create(): ProcessVariableNumberFilterConfig {
        let numberFilterConfig: ProcessVariableNumberFilterConfig;

        if (this.alreadyCreatedFilters.length === 2 && this.alreadyCreatedFilters[0].name === this.alreadyCreatedFilters[1].name) {
            numberFilterConfig = this.recreateBetweenFilter();
        } else if (this.alreadyCreatedFilters.length === 1) {
            numberFilterConfig = this.recreateFilter();
        } else {
            numberFilterConfig = this.createNewFilter();
        }

        numberFilterConfig.allowDecimalValues = this.variable.type === 'bigdecimal';

        return numberFilterConfig;
    }

    private recreateBetweenFilter(): ProcessVariableNumberFilterConfig {
        const greaterThanFilter = this.alreadyCreatedFilters.find((filter) => filter.operator === 'gt' || filter.operator === 'gte');
        const lessThanFilter = this.alreadyCreatedFilters.find((filter) => filter.operator === 'lt' || filter.operator === 'lte');

        const greaterThanFilterValue: number | null =
            greaterThanFilter?.value !== null && greaterThanFilter?.value !== undefined ? +greaterThanFilter.value : null;

        const lessThanFilterValue: number | null =
            lessThanFilter?.value !== null && lessThanFilter?.value !== undefined ? +lessThanFilter.value : null;

        const numberVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: this.process.key,
                variableName: this.variable.name,
                variableType: this.variable.type,
                operator: '',
            },
            name: this.name,
            translationKey: this.translationKey,
            value: {
                value1: greaterThanFilterValue,
                value2: lessThanFilterValue,
                operator: NumberFilterOperatorType.BETWEEN,
            },
            description: this.description,
            visible: true,
        };

        return numberVariableConfig;
    }

    private recreateFilter(): ProcessVariableNumberFilterConfig {
        const alreadyCreatedFilter = this.alreadyCreatedFilters[0];

        const numberVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: this.process.key,
                variableName: this.variable.name,
                variableType: this.variable.type,
                operator: alreadyCreatedFilter.operator,
            },
            name: `${this.name}/${this.process.key}`,
            translationKey: this.translationKey,
            value: {
                value1: alreadyCreatedFilter?.value ? +alreadyCreatedFilter.value : null,
                value2: null,
                operator: alreadyCreatedFilter?.operator
                    ? mapProcessFilterOperatorToNumberOperator(alreadyCreatedFilter.operator)
                    : NumberFilterOperatorType.EQUALS,
            },
            description: this.description,
            visible: true,
        };

        return numberVariableConfig;
    }

    private createNewFilter(): ProcessVariableNumberFilterConfig {
        const numberVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: this.process.key,
                variableName: this.variable.name,
                variableType: this.variable.type,
                operator: 'eq',
            },
            name: this.name,
            translationKey: this.translationKey,
            value: {
                value1: null,
                value2: null,
                operator: NumberFilterOperatorType.EQUALS,
            },
            description: this.description,
            visible: false,
        };

        return numberVariableConfig;
    }
}
