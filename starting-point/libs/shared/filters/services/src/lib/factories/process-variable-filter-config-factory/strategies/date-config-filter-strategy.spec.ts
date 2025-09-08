/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessVariableFilterModelExtension } from '../../interfaces';
import { getProcessVariableDefinition, getProcessDefinitionCloud } from '../../../testing/utils';
import { ProcessDateFilterConfigStrategy } from './date-config.strategy';
import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';
import { ProcessVariableDateFilterConfig } from '../../../filter/filter-models/process-variables-filters';
import { DATE_OPTIONS } from '../../../filter/filter-models/date-filter.model';

describe('ProcessDateFilterConfigStrategy', () => {
    let processDateFilterConfigStrategy: ProcessDateFilterConfigStrategy;

    it('should create new date filter config when there is no already created filters', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension<DateCloudFilterType>[] = [];

        processDateFilterConfigStrategy = new ProcessDateFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const dateVariableFilterConfig = processDateFilterConfigStrategy.create();

        const expectedDateVariableConfig: ProcessVariableDateFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            options: DATE_OPTIONS,
            name: variable.displayName,
            useTime: variable.type === 'datetime',
            translationKey: variable.displayName,
            value: null,
            visible: false,
        };

        expect(dateVariableFilterConfig).toEqual(expectedDateVariableConfig);
    });

    it('should create date filter config based on selected option', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension<DateCloudFilterType>[] = [
            {
                data: DateCloudFilterType.QUARTER,
                processDefinitionKey: process.key,
                name: variable.displayName,
                operator: 'eq',
                type: 'date',
                value: '',
            },
            {
                data: DateCloudFilterType.QUARTER,
                processDefinitionKey: process.key,
                name: variable.displayName,
                operator: 'eq',
                type: 'date',
                value: '',
            },
        ];

        processDateFilterConfigStrategy = new ProcessDateFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const dateVariableFilterConfig = processDateFilterConfigStrategy.create();

        const expectedDateVariableConfig: ProcessVariableDateFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            options: DATE_OPTIONS,
            name: variable.displayName,
            useTime: variable.type === 'datetime',
            translationKey: variable.displayName,
            visible: true,
            value: {
                range: null,
                selectedOption: {
                    value: DateCloudFilterType.QUARTER,
                    label: 'FILTERS.DATE_FILTER.QUARTER',
                },
            },
        };

        expect(dateVariableFilterConfig).toEqual(expectedDateVariableConfig);
    });

    it('should create date filter for custom range', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension<DateCloudFilterType>[] = [
            {
                data: DateCloudFilterType.RANGE,
                processDefinitionKey: process.key,
                name: variable.displayName,
                operator: 'gte',
                type: 'date',
                value: '2024-11-19T11:38:46.990Z',
            },
            {
                data: DateCloudFilterType.RANGE,
                processDefinitionKey: process.key,
                name: variable.displayName,
                operator: 'lte',
                type: 'date',
                value: '2024-11-20T11:38:46.990Z',
            },
        ];

        processDateFilterConfigStrategy = new ProcessDateFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const dateVariableFilterConfig = processDateFilterConfigStrategy.create();

        const expectedDateVariableConfig: ProcessVariableDateFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            options: DATE_OPTIONS,
            name: variable.displayName,
            useTime: variable.type === 'datetime',
            translationKey: variable.displayName,
            visible: true,
            value: {
                range: {
                    from: new Date(alreadyCreatedFilters[0].value),
                    to: new Date(alreadyCreatedFilters[1].value),
                },
                selectedOption: {
                    value: DateCloudFilterType.RANGE,
                    label: 'FILTERS.DATE_FILTER.RANGE',
                },
            },
        };

        expect(dateVariableFilterConfig).toEqual(expectedDateVariableConfig);
    });
});
