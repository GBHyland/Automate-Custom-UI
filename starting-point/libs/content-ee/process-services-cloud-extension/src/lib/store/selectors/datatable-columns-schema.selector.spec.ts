/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';
import { selectProcessDefinitionsVariableColumnsSchema } from './datatable-columns-schema.selector';
import { ProcessWithVariables } from './process-definitions.selector';

interface ProcessVariableDefinition {
    id: string;
    name: string;
    type: string;
    required: boolean;
    display: boolean;
    displayName?: string;
}

const getProcessVariable = (variable: Partial<ProcessVariableDefinition> = {}): ProcessVariableDefinition => {
    return {
        id: 'id',
        name: 'name',
        type: 'text',
        required: false,
        display: false,
        ...variable,
    };
};

const getProcessWithVariables = (variables: ProcessVariableDefinition[], process: Partial<ProcessDefinitionCloud> = {}): ProcessWithVariables => {
    return {
        id: 'id',
        appName: 'appName',
        key: 'processKey',
        appVersion: 1,
        category: '',
        description: '',
        name: 'name',
        version: 1,
        ...process,
        variableDefinitions: variables,
    };
};

describe('selectProcessDefinitionsVariableColumnsSchema', () => {
    it('should return empty array if no variable definitions are returned', () => {
        expect(selectProcessDefinitionsVariableColumnsSchema.projector([])).toEqual([]);
    });

    it('should not create column schema if variables are not set for displaying', () => {
        const variable1 = getProcessVariable();
        const variable2 = getProcessVariable();
        const process = getProcessWithVariables([variable1, variable2]);

        expect(selectProcessDefinitionsVariableColumnsSchema.projector([process])).toEqual([]);
    });

    it('should create two columns for separate variables', () => {
        const variable1 = getProcessVariable({
            id: 'id1',
            display: true,
            displayName: 'Col1',
            name: 'variableName1',
            type: 'text',
        });

        const variable2 = getProcessVariable({
            id: 'id2',
            display: true,
            displayName: 'Col2',
            name: 'variableName2',
            type: 'text',
        });

        const process = getProcessWithVariables([variable1, variable2]);

        const columnsSchema = selectProcessDefinitionsVariableColumnsSchema.projector([process]);

        const expectedColumnSchema = [
            {
                id: `${variable1.displayName}/${variable1.id}`,
                key: 'variablesMap.Col1/id1.value',
                title: variable1.displayName,
                subtitle: undefined,
                type: 'text',
                draggable: true,
                sortable: true,
                desktopOnly: true,
                isHidden: true,
                class: 'adf-ellipsis-cell',
                customData: {
                    subtitle: undefined,
                    assignedVariableDefinitionIds: [variable1.id],
                    columnType: 'process-variable-column',
                    variableType: 'text',
                    variableDefinitionsPayload: [`${process.key}/${variable1.name}`],
                },
            },
            {
                id: `${variable2.displayName}/${variable2.id}`,
                key: 'variablesMap.Col2/id2.value',
                title: variable2.displayName,
                subtitle: undefined,
                type: 'text',
                draggable: true,
                sortable: true,
                desktopOnly: true,
                isHidden: true,
                class: 'adf-ellipsis-cell',
                customData: {
                    subtitle: undefined,
                    assignedVariableDefinitionIds: [variable2.id],
                    columnType: 'process-variable-column',
                    variableType: 'text',
                    variableDefinitionsPayload: [`${process.key}/${variable2.name}`],
                },
            },
        ];

        expect(columnsSchema.length).toBe(2);
        expect(columnsSchema).toEqual(expectedColumnSchema as any);
    });

    it('should add subtile to process with duplicated variable name', () => {
        const variable1 = getProcessVariable({
            id: 'id1',
            display: true,
            displayName: 'Col',
            name: 'variableName1',
            type: 'text',
        });

        const variable2 = getProcessVariable({
            id: 'id2',
            display: true,
            displayName: 'Col',
            name: 'variableName2',
            type: 'text',
        });

        const process1 = getProcessWithVariables([variable1], {
            id: 'process1',
            key: 'process1',
            name: 'process-name-1',
        });

        const process2 = getProcessWithVariables([variable2], {
            id: 'process2',
            key: 'process2',
            name: 'process-name-2',
        });

        const columnsSchema = selectProcessDefinitionsVariableColumnsSchema.projector([process1, process2]);

        const expectedColumnSchema = [
            {
                id: `${variable1.displayName}/${variable1.id}`,
                key: 'variablesMap.Col/id1.value',
                title: variable1.displayName,
                subtitle: process1.name,
                type: 'text',
                draggable: true,
                sortable: true,
                desktopOnly: true,
                isHidden: true,
                class: 'adf-ellipsis-cell',
                customData: {
                    assignedVariableDefinitionIds: [variable1.id],
                    columnType: 'process-variable-column',
                    variableType: 'text',
                    variableDefinitionsPayload: [`${process1.key}/${variable1.name}`],
                    subtitle: process1.name,
                },
            },
            {
                id: `${variable2.displayName}/${variable2.id}`,
                key: 'variablesMap.Col/id2.value',
                title: variable1.displayName,
                subtitle: process2.name,
                type: 'text',
                draggable: true,
                sortable: true,
                desktopOnly: true,
                isHidden: true,
                class: 'adf-ellipsis-cell',
                customData: {
                    assignedVariableDefinitionIds: [variable2.id],
                    columnType: 'process-variable-column',
                    variableType: 'text',
                    variableDefinitionsPayload: [`${process2.key}/${variable2.name}`],
                    subtitle: process2.name,
                },
            },
        ];

        expect(columnsSchema.length).toBe(2);
        expect(columnsSchema).toEqual(expectedColumnSchema as any);
    });

    it('should set "medium" format for datetime variable', () => {
        const dateTimeVariable = getProcessVariable({
            id: 'id1',
            display: true,
            displayName: 'Col',
            name: 'variableName1',
            type: 'datetime',
        });

        const process = getProcessWithVariables([dateTimeVariable], {
            id: 'process1',
            key: 'process1',
            name: 'process-name-1',
        });

        const columnsSchema = selectProcessDefinitionsVariableColumnsSchema.projector([process]);

        expect(columnsSchema[0].dateConfig).toEqual({
            format: 'medium',
            tooltipFormat: 'medium',
        });
    });

    it('should set "mediumDate" format for date variable', () => {
        const dateVariable = getProcessVariable({
            id: 'id1',
            display: true,
            displayName: 'Col',
            name: 'variableName1',
            type: 'date',
        });

        const process = getProcessWithVariables([dateVariable], {
            id: 'process1',
            key: 'process1',
            name: 'process-name-1',
        });

        const columnsSchema = selectProcessDefinitionsVariableColumnsSchema.projector([process]);

        expect(columnsSchema[0].dateConfig).toEqual({
            format: 'mediumDate',
            tooltipFormat: 'mediumDate',
        });
    });
});
