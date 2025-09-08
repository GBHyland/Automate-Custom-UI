/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { ProcessVariableDateFilter } from '../../filter';
import { DateCloudFilterType, DateRangeFilterService } from '@alfresco/adf-process-services-cloud';
import { ProcessVariableFilterModelExtension } from '../interfaces';
import { mapDateToLocalTimeZone } from '../mappers';

@Injectable({
    providedIn: 'root',
})
export class VariableDateModelCreator {
    private readonly dateRangeFilterService = inject(DateRangeFilterService);

    create(processDateFilter: ProcessVariableDateFilter) {
        const processVariableFiltersModel: ProcessVariableFilterModelExtension[] = [];

        const selectedOption = processDateFilter.value?.selectedOption?.value as DateCloudFilterType;
        const isCustomDateRange = this.dateRangeFilterService.isDateRangeType(selectedOption);

        if (isCustomDateRange) {
            const from = processDateFilter.value?.range?.from?.toISOString();
            const to = processDateFilter.value?.range?.to?.toISOString();

            if (from) {
                processVariableFiltersModel.push({
                    processDefinitionKey: processDateFilter.data.processDefinitionKey,
                    name: processDateFilter.data.variableName,
                    type: processDateFilter.data.variableType,
                    value: mapDateToLocalTimeZone(from),
                    operator: 'gte',
                    data: processDateFilter.value?.selectedOption?.value,
                });
            }

            if (to) {
                processVariableFiltersModel.push({
                    processDefinitionKey: processDateFilter.data.processDefinitionKey,
                    name: processDateFilter.data.variableName,
                    type: processDateFilter.data.variableType,
                    value: mapDateToLocalTimeZone(to),
                    operator: 'lte',
                    data: processDateFilter.value?.selectedOption?.value,
                });
            }
        } else {
            if (selectedOption === DateCloudFilterType.TODAY) {
                const today = new Date().toISOString().slice(0, 10);

                processVariableFiltersModel.push({
                    processDefinitionKey: processDateFilter.data.processDefinitionKey,
                    name: processDateFilter.data.variableName,
                    type: processDateFilter.data.variableType,
                    value: today,
                    operator: 'eq',
                    data: processDateFilter.value?.selectedOption?.value,
                });
            } else {
                const { startDate, endDate } = this.dateRangeFilterService.getDateRange(selectedOption);

                // Dates without time (e.g. in forms) are not converted to UTC according to local timezone
                // After select 2025-01-29 YYYY-MM-DD, it is saved as 2025-01-29T00:00:00.000Z (UTC+0)
                // 'dateRangeFilterService' returns dates in UTC converted from local timezone
                // e.g. in PL timezone is UTC+1, therefore for selected WEEK range, start of the week should be:
                // 2025-01-19T00:00:00.000+01:00 but since 'dateRangeFilterService' converts it to UTC+0 we have
                // 2025-01-18T23:00:00.000Z - we need to convert it back to local timezone, so we have the same dates saved in forms and in the filters
                const from = startDate ? mapDateToLocalTimeZone(startDate) : undefined;
                const to = endDate ? mapDateToLocalTimeZone(endDate) : undefined;

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
            }
        }

        return processVariableFiltersModel;
    }
}
