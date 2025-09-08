/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Condition, ConditionOperator, ConditionStatement, ConditionStatementType, Predicate, PredicateOperator } from '../../model/conditions.model';
import { FormFieldTypes, FormRulesEvent } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { HandleRuleEventOnProcessFinishData, OnProcessFinishCondition } from '../interfaces';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';

@Injectable({
    providedIn: 'root',
})
export class EventFiltersService {
    private variableResolver = inject(VariableResolverService);

    eventMatchesRule(event: FormRulesEvent, filter: string | Predicate | undefined, data?: HandleRuleEventOnProcessFinishData) {
        if (filter) {
            if (typeof filter === 'string') {
                return this.testExpression(filter, event);
            } else if (filter.conditions && filter.conditions.length > 0) {
                switch (filter.operator) {
                    case PredicateOperator.None: {
                        return !filter.conditions.some((condition) => this.testCondition(condition, event, data));
                    }
                    case PredicateOperator.Some: {
                        return filter.conditions.some((condition) => this.testCondition(condition, event, data));
                    }
                    default: {
                        return filter.conditions.every((condition) => this.testCondition(condition, event, data));
                    }
                }
            }
        }
        return true;
    }

    private testExpression(expression: string, event: FormRulesEvent): boolean {
        return !!this.variableResolver.resolveExpressionString(expression, event);
    }

    private testCondition(
        condition: Condition | OnProcessFinishCondition,
        event: FormRulesEvent,
        data?: HandleRuleEventOnProcessFinishData
    ): boolean {
        if (this.isOnProcessFinishCondition(condition)) {
            return condition.value === data?.process.correlationKey;
        }

        let leftValue = this.getConditionStatementValue(condition?.left, event);

        if (event?.field?.type === FormFieldTypes.DROPDOWN && leftValue === 'empty') {
            leftValue = null;
        }

        if (
            (event?.field?.type === FormFieldTypes.DATE || event?.field?.type === FormFieldTypes.DATETIME) &&
            leftValue === null &&
            condition.right.type === ConditionStatementType.Expression
        ) {
            leftValue = '';
        }

        const rightValue = this.getConditionStatementValue(condition?.right, event);

        switch (condition.operator) {
            case ConditionOperator.EQ: {
                return this.areNumeric(leftValue, rightValue) ? Number(leftValue) === Number(rightValue) : leftValue === rightValue;
            }
            case ConditionOperator.GE: {
                return leftValue >= rightValue;
            }
            case ConditionOperator.GT: {
                return leftValue > rightValue;
            }
            case ConditionOperator.LE: {
                return leftValue <= rightValue;
            }
            case ConditionOperator.LT: {
                return leftValue < rightValue;
            }
            case ConditionOperator.NE: {
                return this.areNumeric(leftValue, rightValue) ? Number(leftValue) !== Number(rightValue) : leftValue !== rightValue;
            }
            case ConditionOperator.CT: {
                return this.statementContainsValue(leftValue, rightValue);
            }
            case ConditionOperator.NC: {
                return !this.statementContainsValue(leftValue, rightValue);
            }
            default: {
                return !!leftValue;
            }
        }
    }

    private areNumeric(...values: string[]): boolean {
        return values.every((value) => String(value).trim() !== '' && !Number.isNaN(Number(value)));
    }

    private statementContainsValue(leftValue: unknown, rightValue: unknown): boolean {
        if (typeof leftValue === 'string' && typeof rightValue === 'string') {
            return leftValue.includes(rightValue);
        } else if (Array.isArray(leftValue)) {
            return leftValue.some((value) => value.id === rightValue || value.name === rightValue);
        }
        return false;
    }

    private getConditionStatementValue(conditionStatement: ConditionStatement, event: FormRulesEvent): any {
        if (!conditionStatement) {
            return conditionStatement;
        }
        switch (conditionStatement.type) {
            case ConditionStatementType.Expression: {
                return this.variableResolver.resolveExpressionString(conditionStatement.value, event);
            }
            case ConditionStatementType.Variable: {
                return this.variableResolver.resolveExpression(conditionStatement.value.id, event, true);
            }
            case ConditionStatementType.Value:
            default: {
                return conditionStatement.value;
            }
        }
    }

    private isOnProcessFinishCondition(condition: Condition | OnProcessFinishCondition): condition is OnProcessFinishCondition {
        return condition?.['type'] === 'CORRELATION_KEY';
    }
}
