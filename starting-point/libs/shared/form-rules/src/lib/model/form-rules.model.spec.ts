/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FieldInputs, FormActionsUtils } from './form-rules.model';

describe('FormActionsUtils', () => {
    describe('getFieldInputsValues', () => {
        const allFieldInputs: FieldInputs[] = Object.values(FieldInputs);

        it('should return all field input values when no inputs are excluded', () => {
            const result = FormActionsUtils.getFieldInputsValues();

            expect(result).toEqual(allFieldInputs);
        });

        it('should exclude a single input when provided', () => {
            const excluded = [FieldInputs.DISPLAY];

            const result = FormActionsUtils.getFieldInputsValues(excluded);

            expect(result).toEqual([FieldInputs.DISABLED, FieldInputs.REQUIRED, FieldInputs.VALUE]);
        });

        it('should exclude multiple inputs when provided', () => {
            const excluded = [FieldInputs.DISPLAY, FieldInputs.VALUE];
            const result = FormActionsUtils.getFieldInputsValues(excluded);

            expect(result).toEqual([FieldInputs.DISABLED, FieldInputs.REQUIRED]);
        });

        it('should return empty array when all inputs are excluded', () => {
            const excluded = Object.values(FieldInputs);
            const result = FormActionsUtils.getFieldInputsValues(excluded);

            expect(result).toEqual([]);
        });

        it('should return all values when empty exclusion array is provided', () => {
            const excluded: FieldInputs[] = [];
            const result = FormActionsUtils.getFieldInputsValues(excluded);

            expect(result).toEqual(allFieldInputs);
        });

        it('should handle duplicate excluded inputs without errors', () => {
            const excluded = [FieldInputs.DISPLAY, FieldInputs.DISPLAY];
            const result = FormActionsUtils.getFieldInputsValues(excluded);

            expect(result).toEqual([FieldInputs.DISABLED, FieldInputs.REQUIRED, FieldInputs.VALUE]);
        });

        it('should return values as strings', () => {
            const result = FormActionsUtils.getFieldInputsValues();

            for (const value of result) {
                expect(typeof value).toBe('string');
            }
        });
    });
});
