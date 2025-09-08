/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PredicateOperator } from '../model/conditions.model';
import { FormRulesMockBuilder } from './builders/form-rule-event-mock.builder';
import { getFormDefinitionMock } from './form-rules.mock';
import { handleRuleEventOnProcessFinishDataMock } from './on-process-finish-data.mock';
import { FormRules } from '../model/form-rules.model';

export const getStartProcessRule = (): FormRules => {
    const startProcessRules = new FormRulesMockBuilder()
        .withFormEvent('formLoaded', (payloadBuilder) => {
            return payloadBuilder
                .withStartProcessAction({
                    processName: 'fetch-data',
                    correlationKey: 'correlation-key-fetch-data',
                })
                .build();
        })
        .build();

    return startProcessRules;
};

export const getSetVariableRuleOnProcessFinish = (): FormRules => {
    const startProcessRules = new FormRulesMockBuilder()
        .withFormEvent('onProcessFinish', (payloadBuilder) => {
            return payloadBuilder
                .withAction({
                    target: `variable.${getFormDefinitionMock().variables[0].id}`,
                    payload: {
                        value: `\${process.variable.${handleRuleEventOnProcessFinishDataMock.process.variable.processVariable.name}}`,
                    },
                })
                .build();
        })
        .build();

    return startProcessRules;
};

export const getSetVariableRuleOnProcessFinishWithFilter = (): FormRules => {
    const startProcessRules = new FormRulesMockBuilder()
        .withFormEvent('onProcessFinish', (payloadBuilder) => {
            return payloadBuilder
                .withAction({
                    target: `variable.${getFormDefinitionMock().variables[0].id}`,
                    payload: {
                        value: `\${process.variable.${handleRuleEventOnProcessFinishDataMock.process.variable.processVariable.name}}`,
                    },
                })
                .withPredicateFilter({
                    operator: PredicateOperator.Every,
                    conditions: [
                        {
                            type: 'CORRELATION_KEY',
                            value: 'correlation-key',
                        },
                    ],
                })
                .build();
        })
        .build();

    return startProcessRules;
};
