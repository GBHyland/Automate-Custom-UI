/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormModel, FormRulesEvent } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { VariableResolverService } from './variable-resolver.service';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';

describe('VariableResolverService', () => {
    let service: VariableResolverService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VariableResolverService,
                provideMockFeatureFlags({
                    [STUDIO_SHARED.STUDIO_CALCULATIONS_ON_FORM_FIELDS]: true,
                }),
            ],
        });
        service = TestBed.inject(VariableResolverService);
    });

    it('should resolve field expression to field value if field value is not empty', () => {
        const expectedValue = 'value1';
        const event: FormRulesEvent = {
            form: {
                getFormFields: () => [{ id: 'field1', value: 'value1' }],
            } as FormModel,
        } as FormRulesEvent;

        const result = service.resolveExpression('${field.field1}', event);
        expect(result).toBe(expectedValue);
    });

    it('should resolve field expression to empty string if field value is empty string', () => {
        const expectedValue = '';
        const event: FormRulesEvent = {
            form: {
                getFormFields: () => [{ id: 'field2', value: '' }],
            } as FormModel,
        } as FormRulesEvent;

        const result = service.resolveExpression('${field.field2}', event);
        expect(result).toBe(expectedValue);
    });

    it('should resolve field expression to match value if field value is null', () => {
        const expectedValue = '${field.field3}';
        const event: FormRulesEvent = {
            form: {
                getFormFields: () => [{ id: 'field3', value: null }],
            } as FormModel,
        } as FormRulesEvent;

        const result = service.resolveExpression('${field.field3}', event);
        expect(result).toBe(expectedValue);
    });

    it('should resolve field expression to match value if field value is undefined', () => {
        const expectedValue = '${field.field4}';
        const event: FormRulesEvent = {
            form: {
                getFormFields: () => [{ id: 'field4' }],
            } as FormModel,
        } as FormRulesEvent;

        const result = service.resolveExpression('${field.field4}', event);
        expect(result).toBe(expectedValue);
    });

    it('should return null if allowNull is true and value is null', () => {
        const event: FormRulesEvent = {
            form: {
                getFormFields: () => [{ id: 'field5', value: null }],
            } as FormModel,
        } as FormRulesEvent;

        const result = service.resolveExpression('${field.field5}', event, true);
        expect(result).toBeNull();
    });

    describe('formula', () => {
        it('should NOT perform logic if expression does not start with =', () => {
            const expectedValue = '5 + 5';
            const event: FormRulesEvent = {
                form: {
                    getFormFields: () => [],
                } as FormModel,
            } as FormRulesEvent;

            const result = service.resolveExpression('5 + 5', event);
            expect(result).toBe(expectedValue);
        });

        describe('without variables', () => {
            it('should correctly perform addition', () => {
                const expectedValue = '10';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=5 + 5', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform subtraction', () => {
                const expectedValue = '3';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=5 - 2', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform multiplication', () => {
                const expectedValue = '25';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=5 * 5', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division', () => {
                const expectedValue = '2.5';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=5 / 2', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform division when dividing by 0', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=5 / 0', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division with only 2 decimal points', () => {
                const expectedValue = '0.33';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=1 / 3', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform complex operation', () => {
                const expectedValue = '10';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=(5 + 5) * 2 / 4 + 5', event);
                expect(result).toBe(expectedValue);
            });
        });

        describe('with variables', () => {
            it('should correctly perform addition', () => {
                const expectedValue = '15';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '10' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform subtraction', () => {
                const expectedValue = '5';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: '5' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} - ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform multiplication', () => {
                const expectedValue = '50';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '10' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} * ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division', () => {
                const expectedValue = '2';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: '5' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform division when dividing by 0', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: '0' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division with only 2 decimal points', () => {
                const expectedValue = '0.33';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '1' },
                            { id: 'field2', value: '3' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform complex operation', () => {
                const expectedValue = '35';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '10' },
                            { id: 'field3', value: '2' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=(${field.field1} + ${field.field2}) * ${field.field3} + ${field.field1}', event);
                expect(result).toBe(expectedValue);
            });
        });

        describe('with mix of variables and numbers', () => {
            it('should correctly perform addition', () => {
                const expectedValue = '15';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '5' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + 10', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform subtraction', () => {
                const expectedValue = '5';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '10' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} - 5', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform multiplication', () => {
                const expectedValue = '50';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '5' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} * 10', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division', () => {
                const expectedValue = '2';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '10' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / 5', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform division when dividing by 0', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '10' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / 0', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform division with only 2 decimal points', () => {
                const expectedValue = '0.33';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [{ id: 'field1', value: '1' }],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / 3', event);
                expect(result).toBe(expectedValue);
            });

            it('should correctly perform complex operation', () => {
                const expectedValue = '35';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '10' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=(${field.field1} + ${field.field2}) * 2 + ${field.field1}', event);
                expect(result).toBe(expectedValue);
            });
        });

        describe('with empty variables', () => {
            it('should perform addition even if variables are not defined', () => {
                const expectedValue = '5';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should perform subtraction even if variables are not defined', () => {
                const expectedValue = '10';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: '' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} - ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should perform multiplication even if variables are not defined', () => {
                const expectedValue = '0';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '' },
                            { id: 'field2', value: '10' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} * ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should perform addition even if sum of the variables has >15 significant digits', () => {
                const expectedValue = '12.03';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '1.48' },
                            { id: 'field2', value: '10.55' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform division if variables are not defined', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: '' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should perform complex operation even if variables are not defined [replacing undefined with zero]', () => {
                const expectedValue = '15';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: '' },
                            { id: 'field3', value: '2' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=(${field.field1} + ${field.field2}) * ${field.field3} + ${field.field1}', event);
                expect(result).toBe(expectedValue);
            });
        });

        describe('with invalid variables', () => {
            it('should NOT perform addition if variables are not valid', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: 'a' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform subtraction if variables are not valid', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: 'b' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} - ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform multiplication if variables are not valid', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: 'c' },
                            { id: 'field2', value: '10' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} * ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform division if variables are not valid', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '10' },
                            { id: 'field2', value: 'd' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} / ${field.field2}', event);
                expect(result).toBe(expectedValue);
            });

            it('should NOT perform complex operation if variables are not valid', () => {
                const expectedValue = '';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: '5' },
                            { id: 'field2', value: 'e' },
                            { id: 'field3', value: '2' },
                        ],
                    } as FormModel,
                } as FormRulesEvent;

                const result = service.resolveExpression('=(${field.field1} + ${field.field2}) * ${field.field3} + ${field.field1}', event);
                expect(result).toBe(expectedValue);
            });
        });

        describe('with zero value variables', () => {
            it('should perform addition if variables are all set to zero', () => {
                const expectedValue = '0';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: 0 },
                            { id: 'field2', value: 0 },
                            { id: 'field3', value: 0 },
                        ],
                    } as FormModel,
                    type: 'formLoaded',
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2} + ${field.field3}', event);
                expect(result).toBe(expectedValue);
            });

            it('should perform addition if some variables are set to zero', () => {
                const expectedValue = '4';
                const event: FormRulesEvent = {
                    form: {
                        getFormFields: () => [
                            { id: 'field1', value: 2 },
                            { id: 'field2', value: 0 },
                            { id: 'field3', value: 2 },
                        ],
                    } as FormModel,
                    type: 'formLoaded',
                } as FormRulesEvent;

                const result = service.resolveExpression('=${field.field1} + ${field.field2} + ${field.field3}', event);
                expect(result).toBe(expectedValue);
            });
        });
    });

    it('should build variable context with process variable values', () => {
        const mockFormModel: Partial<FormModel> = {
            getFormFields: () => [],
            variables: [
                { id: 'var1', name: 'variable1' },
                { id: 'var2', name: 'variable2' },
            ],
            getProcessVariableValue: (name: string) => `value_of_${name}`,
        };

        const event: FormRulesEvent = {
            form: mockFormModel as FormModel,
        } as FormRulesEvent;

        const context = service.buildVariableContext(event);

        expect(context.variable['var1']).toBe('value_of_variable1');
        expect(context.variable['variable1']).toBe('value_of_variable1');
        expect(context.variable['var2']).toBe('value_of_variable2');
        expect(context.variable['variable2']).toBe('value_of_variable2');
    });
});
