/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { ExtensionColumnPreset } from '../../models/extension-column-preset.interface';
import { selectProcessesWithVariableEntities } from './process-definitions.selector';

interface VariableColumnCustomData {
    variableDefinitionsPayload: string[];
    assignedVariableDefinitionIds: string[];
    columnType: 'process-variable-column';
    variableType: string;
    subtitle?: string;
}

export const selectProcessDefinitionsVariableColumnsSchema = createSelector(selectProcessesWithVariableEntities, (processes) => {
    const variableMap: {
        [variableDisplayName: string]: {
            key: string;
            displayName: string;
            customData: VariableColumnCustomData;
        };
    } = {};

    processes.forEach((process) => {
        const processKey = process.key;
        const processVariables = process.variableDefinitions;

        processVariables
            .filter((variable) => variable.display)
            .forEach((variable) => {
                const assignedVariableDefinitionPayload = `${processKey}/${variable.name}`;

                const isDisplayNameDuplicatedInDifferentProcess = processes.some((otherProcess) => {
                    const isTheSameProcess = otherProcess.id === process.id;

                    if (isTheSameProcess) {
                        return false;
                    }

                    return otherProcess.variableDefinitions.some((otherVariable) => {
                        return otherVariable.displayName === variable.displayName && otherVariable.id !== variable.id;
                    });
                });

                variableMap[`${variable.displayName}/${process.key}`] = {
                    key: variable.displayName,
                    displayName: variable.displayName,
                    customData: {
                        columnType: 'process-variable-column',
                        variableType: variable.type,
                        variableDefinitionsPayload: [assignedVariableDefinitionPayload],
                        assignedVariableDefinitionIds: [variable.id],
                        subtitle: isDisplayNameDuplicatedInDifferentProcess ? process.name : undefined,
                    },
                };
            });
    });

    const columnSchema = Object.values(variableMap).map<ExtensionColumnPreset>((variable) => {
        let id = `${variable.displayName}/${variable.customData.assignedVariableDefinitionIds[0]}`;

        // Since values for datatable rows objects are searched using 'keys' e.g.
        // 'variablesMap.[id].value' -> { variablesMap: { [id]: { value } }
        // we cannot have dots in id
        id = id.replace('.', '');

        const extensionColumnPreset: ExtensionColumnPreset = {
            id,
            key: `variablesMap.${id}.value`,
            title: variable.displayName,
            subtitle: variable.customData.subtitle,
            type: 'text',
            draggable: true,
            sortable: true,
            desktopOnly: true,
            isHidden: true,
            class: 'adf-ellipsis-cell',
            customData: variable.customData,
        };

        let format: undefined | string;
        if (variable.customData.variableType === 'datetime') {
            format = 'medium';
        } else if (variable.customData.variableType === 'date') {
            format = 'mediumDate';
        }

        if (format) {
            extensionColumnPreset.dateConfig = {
                tooltipFormat: format,
                format,
            };
        }

        return extensionColumnPreset;
    });

    return columnSchema;
});
