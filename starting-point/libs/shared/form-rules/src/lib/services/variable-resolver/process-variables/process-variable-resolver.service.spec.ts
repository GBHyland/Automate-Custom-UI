/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ProcessVariableResolverService } from './process-variable-resolver.service';

describe('ProcessVariableResolverService', () => {
    let service: ProcessVariableResolverService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProcessVariableResolverService],
        });
        service = TestBed.inject(ProcessVariableResolverService);
    });

    it('should resolve process variable when expression is simple variable', () => {
        const variableName = 'variableName';
        const expectedValue = 'value';

        const resolvedValue = service.resolve({
            expression: `process.variable.${variableName}`,
            processInstanceVariables: {
                [variableName]: {
                    value: expectedValue,
                },
            },
        });

        expect(resolvedValue).toBe(expectedValue);
    });

    it('should resolve process variable when expression value is an object', () => {
        const variableName = 'variableName';
        const expectedValue = { name: 'name' };

        const resolvedValue = service.resolve({
            expression: `process.variable.${variableName}`,
            processInstanceVariables: {
                [variableName]: {
                    value: expectedValue,
                },
            },
        });

        expect(resolvedValue).toBe(expectedValue);
    });

    it('should resolve process variable when expression is nested object', () => {
        const variablePath = 'variableName.policyDetails.owner';
        const expectedValue = 'John Snow';

        const resolvedValue = service.resolve({
            expression: `process.variable.${variablePath}`,
            processInstanceVariables: {
                variableName: {
                    value: {
                        policyDetails: {
                            owner: expectedValue,
                        },
                    },
                },
            },
        });

        expect(resolvedValue).toBe(expectedValue);
    });

    it('should work when path to nested value is wrong', () => {
        const variablePath = 'variableName.policyDetails.owner_S';

        const resolvedValue = service.resolve({
            expression: `process.variable.${variablePath}`,
            processInstanceVariables: {
                variableName: {
                    value: {
                        policyDetails: {
                            owner: 'John Snow',
                        },
                    },
                },
            },
        });

        expect(resolvedValue).toBe(undefined);
    });
});
