/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessVariableFilterModelExtension } from '../../interfaces';
import { ProcessNumberFilterConfigStrategy } from './number-config-filter.strategy';
import { NumberFilterOperatorType } from '../../../filter/filter.model';
import { ProcessVariableNumberFilterConfig } from '../../../filter/filter-models/process-variables-filters';
import { getProcessDefinitionCloud, getProcessVariableDefinition } from '../../../testing/utils';

describe('ProcessNumberFilterConfigStrategy', () => {
    let processNumberFilterConfigStrategy: ProcessNumberFilterConfigStrategy;

    it('should create new number filter config when there is no already created filters', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [];

        processNumberFilterConfigStrategy = new ProcessNumberFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const integerVariableFilterConfig = processNumberFilterConfigStrategy.create();

        const expectedIntegerVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: 'eq',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: {
                value1: null,
                value2: null,
                operator: NumberFilterOperatorType.EQUALS,
            },
            visible: false,
            description: undefined,
            allowDecimalValues: false,
        };

        expect(integerVariableFilterConfig).toEqual(expectedIntegerVariableConfig);
    });

    it('should create number filter config based on already created filter', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [
            {
                processDefinitionKey: process.key,
                name: variable.displayName,
                type: variable.type,
                value: 5,
                operator: 'lte',
            },
        ];

        processNumberFilterConfigStrategy = new ProcessNumberFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const integerVariableFilterConfig = processNumberFilterConfigStrategy.create();

        const expectedIntegerVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: 'lte',
            },
            name: 'displayName/process_definition_key',
            translationKey: variable.displayName,
            description: undefined,
            value: {
                value1: alreadyCreatedFilters[0].value as number,
                value2: null,
                operator: NumberFilterOperatorType.LESS_THAN_OR_EQUALS,
            },
            visible: true,
            allowDecimalValues: false,
        };

        expect(integerVariableFilterConfig).toEqual(expectedIntegerVariableConfig);
    });

    it('should create number filter config for "between" filter type', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [
            {
                processDefinitionKey: process.key,
                name: variable.displayName,
                type: variable.type,
                value: 5,
                operator: 'lte',
            },
            {
                processDefinitionKey: process.key,
                name: variable.displayName,
                type: variable.type,
                value: 1,
                operator: 'gte',
            },
        ];

        processNumberFilterConfigStrategy = new ProcessNumberFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const integerVariableFilterConfig = processNumberFilterConfigStrategy.create();

        const expectedIntegerVariableConfig: ProcessVariableNumberFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: {
                value1: alreadyCreatedFilters[1].value as number,
                value2: alreadyCreatedFilters[0].value as number,
                operator: NumberFilterOperatorType.BETWEEN,
            },
            visible: true,
            description: undefined,
            allowDecimalValues: false,
        };

        expect(integerVariableFilterConfig).toEqual(expectedIntegerVariableConfig);
    });
});
