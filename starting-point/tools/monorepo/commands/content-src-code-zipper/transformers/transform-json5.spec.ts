/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { transformJson5Files } from './transform-json5';
import JSON5 from 'json5';

describe('transformJson5', () => {
    const json5 = {
        variables: {
            VAL1: 'VAL1',
            VAL2: 'VAL2',
            VAL3: 'VAL3',
        },
    } as const;

    it('should update variables', async () => {
        const variables = transformJson5Files(
            'fakeFilePath',
            {
                variablesToUpdate: [
                    { key: 'VAL1', value: 'NEW_VAL1' },
                    { key: 'VAL2', value: 'NEW_VAL2' },
                ],
            },
            () => json5
        );

        const parserVariables = JSON5.parse(variables);

        expect(parserVariables['variables']['VAL1']).toBe('NEW_VAL1');
        expect(parserVariables['variables']['VAL2']).toBe('NEW_VAL2');
        expect(parserVariables['variables']['VAL3']).toBe(json5.variables.VAL3);
    });

    it('should work with no variables to update', async () => {
        const variables = transformJson5Files(
            'fakeFilePath',
            {
                variablesToUpdate: [],
            },
            () => json5
        );

        const parserVariables = JSON5.parse(variables);

        expect(parserVariables['variables']['VAL1']).toBe(json5.variables.VAL1);
        expect(parserVariables['variables']['VAL2']).toBe(json5.variables.VAL2);
    });
});
