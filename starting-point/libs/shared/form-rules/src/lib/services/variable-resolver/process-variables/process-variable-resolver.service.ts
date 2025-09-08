/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { PROCESS_VARIABLES_PREFIX } from '../../../model/form-rules.model';

interface ProcessInstanceVariableMap {
    [variableName: string]: { value: string | object };
}

interface ProcessVariableResolverData {
    expression: string;
    processInstanceVariables: ProcessInstanceVariableMap;
}

@Injectable({
    providedIn: 'root',
})
export class ProcessVariableResolverService {
    resolve(data: ProcessVariableResolverData): string | object | undefined {
        const { expression, processInstanceVariables } = data;
        const variableName = expression.slice(PROCESS_VARIABLES_PREFIX.length);

        const processVariableValue = this.getValue(variableName, processInstanceVariables);

        return processVariableValue;
    }

    private getValue(expression: string, processVariables: ProcessInstanceVariableMap): string | object | undefined {
        const expressionChunks = expression.split('.');
        const isNestedPath = expressionChunks.length > 1;
        const processVariableName = expressionChunks[0];
        const variableValue = processVariables[processVariableName]?.value;

        if (!isNestedPath) {
            return variableValue ?? undefined;
        }

        const nestedValuePath = expressionChunks.slice(1).join('.');
        return this.getNestedValue(nestedValuePath, variableValue as object);
    }

    private getNestedValue(valuePath: string, processVariables: object): string | object | undefined {
        const pathChunks = valuePath.split('.');
        const firstPathChunk = pathChunks[0];
        const remainingPath = pathChunks.slice(1).join('.');

        const processValue = processVariables[firstPathChunk];

        if (processValue === undefined) {
            return undefined;
        }

        if (remainingPath) {
            return this.getNestedValue(remainingPath, processValue);
        }

        return processValue;
    }
}
