/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import JSON5 from 'json5';
import { join } from 'node:path';

// Needed for node 'require' to be able to work with json5
require('json5/lib/register');

export interface TransformProjectVariablesConfig {
    variablesToUpdate: { key: string; value: string }[];
}

function readFileByPath(filePath: string) {
    const resolvedPath = join(process.cwd(), filePath);
    const file = require(resolvedPath);
    return file;
}

export function transformJson5Files(filePath: string, config: TransformProjectVariablesConfig, fileReader?: any) {
    const variablesFile = fileReader ? fileReader(filePath) : readFileByPath(filePath);

    const replacer = (key: string, value: string) => {
        const newVariableValueOption = config.variablesToUpdate.find((newValueSet) => {
            return newValueSet.key === key;
        });

        if (newVariableValueOption) {
            return newVariableValueOption.value;
        }

        return value;
    };

    return JSON5.stringify(variablesFile, replacer, 2);
}
