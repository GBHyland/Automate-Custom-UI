/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessVariableFilterModelExtension } from '../../interfaces';
import { getProcessVariableDefinition, getProcessDefinitionCloud } from '../../../testing/utils';
import { ProcessBooleanFilterConfigStrategy } from './boolean-config-strategy';
import { ProcessVariableRadioFilterConfig } from '../../../filter/filter-models/process-variables-filters';

describe('ProcessBooleanFilterConfigStrategy', () => {
    let processBooleanFilterConfigStrategy: ProcessBooleanFilterConfigStrategy;

    it('should create new radio filter config when there is no already created filters', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [];

        processBooleanFilterConfigStrategy = new ProcessBooleanFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const radioVariableFilterConfig = processBooleanFilterConfigStrategy.create();

        const expectedRadioVariableConfig: ProcessVariableRadioFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: null,
            options: [
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' },
            ],
            visible: false,
        };

        expect(radioVariableFilterConfig).toEqual(expectedRadioVariableConfig);
    });

    it('should create radio filter config based on created filter', () => {
        const variable = getProcessVariableDefinition();
        const process = getProcessDefinitionCloud();
        const alreadyCreatedFilters: ProcessVariableFilterModelExtension[] = [
            {
                processDefinitionKey: process.key,
                name: variable.displayName,
                operator: 'eq',
                type: 'boolean',
                value: 'true',
            },
        ];

        processBooleanFilterConfigStrategy = new ProcessBooleanFilterConfigStrategy(process, variable, alreadyCreatedFilters);

        const radioVariableFilterConfig = processBooleanFilterConfigStrategy.create();

        const expectedRadioVariableConfig: ProcessVariableRadioFilterConfig = {
            data: {
                processDefinitionKey: process.key,
                variableName: variable.name,
                variableType: variable.type,
                operator: '',
            },
            name: variable.displayName,
            translationKey: variable.displayName,
            value: { label: 'true', value: 'true' },
            options: [
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' },
            ],
            visible: true,
        };

        expect(radioVariableFilterConfig).toEqual(expectedRadioVariableConfig);
    });
});
