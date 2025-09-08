/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { DateCloudFilterType, DateRangeFilterService } from '@alfresco/adf-process-services-cloud';
import { NumberFilterOperatorType } from '../filter/filter.model';
import {
    ProcessVariableDateFilter,
    ProcessVariableFilter,
    ProcessVariableNumberFilter,
    ProcessVariableRadioFilter,
    ProcessVariableStringFilter,
} from '../filter/filter-models/process-variables-filters';
import { mapNumberOperatorsToProcessFilterOperator } from './mappers';
import { ProcessVariableFilterModelExtension } from './interfaces';
import { VariableDateModelCreator } from './variable-model-creators/date-model.creator';

@Injectable({ providedIn: 'root' })
export class ProcessVariableModelCreator {
    private readonly dateRangeFilterService = inject(DateRangeFilterService);
    private readonly variableDateModelCreator = inject(VariableDateModelCreator);

    createProcessVariableFilters(processVariableFilters: ProcessVariableFilter[]): ProcessVariableFilterModelExtension[] {
        const processVariableFiltersModel: ProcessVariableFilterModelExtension[] = [];

        for (const processFilter of processVariableFilters) {
            switch (processFilter.data.variableType) {
                case 'string': {
                    const processStringFilter = processFilter as ProcessVariableStringFilter;

                    processVariableFiltersModel.push({
                        processDefinitionKey: processStringFilter.data.processDefinitionKey,
                        name: processStringFilter.data.variableName,
                        type: processStringFilter.data.variableType,
                        value: processStringFilter.value?.join(' ') ?? '',
                        operator: 'like',
                    });
                    break;
                }
                case 'integer':
                case 'bigdecimal': {
                    const processNumberFilter = processFilter as ProcessVariableNumberFilter;

                    if (processNumberFilter.value?.operator === NumberFilterOperatorType.BETWEEN) {
                        processVariableFiltersModel.push(
                            {
                                processDefinitionKey: processNumberFilter.data.processDefinitionKey,
                                name: processNumberFilter.data.variableName,
                                type: processNumberFilter.data.variableType,
                                value: processNumberFilter.value.value1 as number,
                                operator: 'gte',
                                data: processNumberFilter.value.operator,
                            },
                            {
                                processDefinitionKey: processNumberFilter.data.processDefinitionKey,
                                name: processNumberFilter.data.variableName,
                                type: processNumberFilter.data.variableType,
                                value: processNumberFilter.value.value2 as number,
                                operator: 'lte',
                                data: processNumberFilter.value.operator,
                            }
                        );
                    } else {
                        if (processNumberFilter.value.value1 !== null) {
                            processVariableFiltersModel.push({
                                processDefinitionKey: processNumberFilter.data.processDefinitionKey,
                                name: processNumberFilter.data.variableName,
                                type: processNumberFilter.data.variableType,
                                value: processNumberFilter.value?.value1 ?? '',
                                operator: processNumberFilter.value
                                    ? mapNumberOperatorsToProcessFilterOperator(processNumberFilter.value.operator)
                                    : 'eq',
                                data: processNumberFilter.value?.operator,
                            });
                        }
                    }

                    break;
                }

                case 'date': {
                    const dateFilters = this.variableDateModelCreator.create(processFilter as ProcessVariableDateFilter);
                    processVariableFiltersModel.push(...dateFilters);

                    break;
                }

                case 'datetime': {
                    const processDateFilter = processFilter as ProcessVariableDateFilter;
                    const selectedOption = processDateFilter.value?.selectedOption?.value as DateCloudFilterType;
                    const isCustomDateRange = this.dateRangeFilterService.isDateRangeType(selectedOption);

                    let from: string | undefined;
                    let to: string | undefined;

                    if (isCustomDateRange) {
                        from = processDateFilter.value?.range?.from?.toISOString();
                        to = processDateFilter.value?.range?.to?.toISOString();
                    } else {
                        const { startDate, endDate } = this.dateRangeFilterService.getDateRange(selectedOption);

                        from = startDate;
                        to = endDate;
                    }

                    if (from) {
                        processVariableFiltersModel.push({
                            processDefinitionKey: processDateFilter.data.processDefinitionKey,
                            name: processDateFilter.data.variableName,
                            type: processDateFilter.data.variableType,
                            value: from,
                            operator: 'gte',
                            data: processDateFilter.value?.selectedOption?.value,
                        });
                    }

                    if (to) {
                        processVariableFiltersModel.push({
                            processDefinitionKey: processDateFilter.data.processDefinitionKey,
                            name: processDateFilter.data.variableName,
                            type: processDateFilter.data.variableType,
                            value: to,
                            operator: 'lte',
                            data: processDateFilter.value?.selectedOption?.value,
                        });
                    }

                    break;
                }

                case 'boolean': {
                    const processRadioFilter = processFilter as ProcessVariableRadioFilter;
                    processVariableFiltersModel.push({
                        processDefinitionKey: processRadioFilter.data.processDefinitionKey,
                        name: processRadioFilter.data.variableName,
                        type: processRadioFilter.data.variableType,
                        value: processRadioFilter?.value?.value ?? '',
                        operator: 'eq',
                    });
                    break;
                }
            }
        }

        return processVariableFiltersModel;
    }
}
