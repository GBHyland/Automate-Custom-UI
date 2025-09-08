/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessStringFilterConfigStrategy } from './string-config-filter-strategy';
import { ProcessVariableFilterModelExtension } from '../../interfaces';
import { getProcessDefinitionCloud, getProcessVariableDefinition } from '../../../testing/utils';
import { ProcessVariableStringFilterConfig } from '../../../filter/filter-models/process-variables-filters';

describe('ProcessStringFilterConfigStrategy', () => {
    let processStringFilterConfigStrategy: ProcessStringFilterConfigStrategy;

    it('should create new string filter config when there is no already created filters', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [];

        processStringFilterConfigStrategy = new ProcessStringFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const stringVariableFilterConfig = processStringFilterConfigStrategy.create();

        const expectedStringVariableConfig: ProcessVariableStringFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: 'eq',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: [],
            visible: false,
        };

        expect(stringVariableFilterConfig).toEqual(expectedStringVariableConfig);
    });

    it('should create filter based on already created process filter', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [
            {
                processDefinitionKey: process.key,
                name: variable.displayName,
                type: variable.type,
                value: 'string value',
                operator: 'eq',
            },
        ];

        processStringFilterConfigStrategy = new ProcessStringFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const expectedStringVariableConfig: ProcessVariableStringFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: 'eq',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: [alreadyCreatedFilters[0].value as string],
            visible: true,
        };

        const stringVariableFilterConfig = processStringFilterConfigStrategy.create();
        expect(stringVariableFilterConfig).toEqual(expectedStringVariableConfig);
    });
});
