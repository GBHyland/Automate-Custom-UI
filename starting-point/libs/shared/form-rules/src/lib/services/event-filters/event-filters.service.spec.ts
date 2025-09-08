/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { EventFiltersService } from './event-filters.service';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';
import { ConditionOperator, ConditionStatementType, PredicateOperator } from '../../model/conditions.model';

describe('EventFiltersService', () => {
    let service: EventFiltersService;
    let variableResolver: jest.Mocked<VariableResolverService>;

    beforeEach(() => {
        const spy: jest.Mocked<VariableResolverService> = {
            resolveExpressionString: jest.fn(),
            resolveExpression: jest.fn(),
        } as any;
        TestBed.configureTestingModule({
            providers: [EventFiltersService, { provide: VariableResolverService, useValue: spy }],
        });
        service = TestBed.inject(EventFiltersService);
        variableResolver = TestBed.inject(VariableResolverService) as jest.Mocked<VariableResolverService>;
    });

    it('should return true if no filter is provided', () => {
        expect(service.eventMatchesRule({} as any, undefined)).toBeTruthy();
    });

    it('should test string filter using testExpression', () => {
        variableResolver.resolveExpressionString.mockReturnValue(true);
        expect(service.eventMatchesRule({} as any, 'someExpr')).toBeTruthy();
        variableResolver.resolveExpressionString.mockReturnValue(false);
        expect(service.eventMatchesRule({} as any, 'someExpr')).toBeFalsy();
    });

    it('should handle PredicateOperator.None', () => {
        const filter = {
            operator: PredicateOperator.None,
            conditions: [
                {
                    left: { type: ConditionStatementType.Value, value: 1 },
                    operator: ConditionOperator.EQ,
                    right: { type: ConditionStatementType.Value, value: 1 },
                },
            ],
        };
        jest.spyOn(service as any, 'testCondition').mockReturnValue(true);
        expect(service.eventMatchesRule({} as any, filter)).toBeFalsy();
    });

    it('should handle PredicateOperator.Some', () => {
        const filter = {
            operator: PredicateOperator.Some,
            conditions: [
                {
                    left: { type: ConditionStatementType.Value, value: 1 },
                    operator: ConditionOperator.EQ,
                    right: { type: ConditionStatementType.Value, value: 1 },
                },
            ],
        };
        jest.spyOn(service as any, 'testCondition').mockReturnValue(true);
        expect(service.eventMatchesRule({} as any, filter)).toBeTruthy();
    });

    it('should handle PredicateOperator default (every)', () => {
        const filter = {
            operator: PredicateOperator.Every,
            conditions: [
                {
                    left: { type: ConditionStatementType.Value, value: 1 },
                    operator: ConditionOperator.EQ,
                    right: { type: ConditionStatementType.Value, value: 1 },
                },
            ],
        };
        jest.spyOn(service as any, 'testCondition').mockReturnValue(true);
        expect(service.eventMatchesRule({} as any, filter)).toBeTruthy();
    });

    it('should test EQ operator with integer type ', () => {
        const condition = {
            left: { type: ConditionStatementType.Value, value: { type: 'integer' } },
            operator: ConditionOperator.EQ,
            right: { type: ConditionStatementType.Value, value: 1 },
        };
        jest.spyOn(service as any, 'getConditionStatementValue')
            .mockReturnValueOnce('1')
            .mockReturnValueOnce(1);
        expect((service as any).testCondition(condition, {})).toBeTruthy();
    });

    it('should return true for EQ operator when left is string "1" and right is number 1', () => {
        const condition = {
            left: { type: ConditionStatementType.Value, value: { type: 'integer' } },
            operator: ConditionOperator.EQ,
            right: { type: ConditionStatementType.Value, value: 1 },
        };
        jest.spyOn(service as any, 'getConditionStatementValue')
            .mockReturnValueOnce('1') // left value as string
            .mockReturnValueOnce(1); // right value as number
        expect((service as any).testCondition(condition, {})).toBeTruthy();
    });

    it('should test NE operator with integer type', () => {
        const condition = {
            left: { type: ConditionStatementType.Value, value: { type: 'integer' } },
            operator: ConditionOperator.NE,
            right: { type: ConditionStatementType.Value, value: 2 },
        };
        jest.spyOn(service as any, 'getConditionStatementValue')
            .mockReturnValueOnce(1)
            .mockReturnValueOnce(2);
        expect((service as any).testCondition(condition, {})).toBeTruthy();
    });

    it('should return false for NE operator when left is string and right is number', () => {
        const condition = {
            left: { type: ConditionStatementType.Value, value: { type: 'integer' } },
            operator: ConditionOperator.NE,
            right: { type: ConditionStatementType.Value, value: 1 },
        };
        jest.spyOn(service as any, 'getConditionStatementValue')
            .mockReturnValueOnce('1') // left value as string
            .mockReturnValueOnce(1); // right value as number
        expect((service as any).testCondition(condition, {})).toBeFalsy();
    });

    it('should test CT and NC operators', () => {
        expect((service as any).statementContainsValue('abc', 'a')).toBeTruthy();
        expect((service as any).statementContainsValue(['a', 'b'], 'a')).toBeFalsy();
        expect((service as any).statementContainsValue([{ id: '1' }], '1')).toBeTruthy();
    });

    it('should resolve expression in getConditionStatementValue', () => {
        variableResolver.resolveExpressionString.mockReturnValue('resolved');
        const statement = { type: ConditionStatementType.Expression, value: 'expr' };
        expect((service as any).getConditionStatementValue(statement, {})).toBe('resolved');
    });

    it('should resolve variable in getConditionStatementValue', () => {
        variableResolver.resolveExpression.mockReturnValue('var');
        const statement = { type: ConditionStatementType.Variable, value: { id: 'id' } };
        expect((service as any).getConditionStatementValue(statement, {})).toBe('var');
    });

    it('should return value in getConditionStatementValue', () => {
        const statement = { type: ConditionStatementType.Value, value: 123 };
        expect((service as any).getConditionStatementValue(statement, {})).toBe(123);
    });

    it('should identify OnProcessFinishCondition', () => {
        const condition = { type: 'CORRELATION_KEY', value: 'key' };
        expect((service as any).isOnProcessFinishCondition(condition)).toBeTruthy();
    });
});
