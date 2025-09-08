/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormFieldTypes, FormModel, FormVariableModel } from '@alfresco/adf-core';
import { ConditionOperator, ConditionStatementType, PredicateOperator } from '../model/conditions.model';
import { FormRules } from '../model/form-rules.model';

export const getDatatableFormModelMock = (): FormModel => {
    const variables: FormVariableModel[] = [
        {
            id: 'variable1',
            name: 'variable.variable1',
            type: 'text',
            value: '${process.variables.variable1}',
        },
    ];

    const fields = [
        {
            type: FormFieldTypes.CONTAINER,
            fields: {
                dataTable: [
                    {
                        id: 'dataTable',
                        type: FormFieldTypes.DATA_TABLE,
                        variableConfig: {
                            variableName: variables[0].name,
                        },
                    },
                ],
            },
        },
    ];

    return new FormModel({ fields, variables });
};

export const formRulesMock: FormRules = {
    form: {
        formLoaded: [
            {
                actions: [
                    {
                        target: 'field.text',
                        payload: {
                            value: 'formLoaded',
                        },
                    },
                ],
            },
        ],
    },
    fields: {
        text: {
            click: [
                {
                    filter: {
                        conditions: [
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'field.text',
                                        name: 'field.text',
                                        label: 'text',
                                        type: 'string',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'formLoaded',
                                    type: ConditionStatementType.Value,
                                    value: 'formLoaded',
                                },
                            },
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                                        name: 'variable.strVar',
                                        type: 'string',
                                        model: {
                                            $ref: '#/$defs/primitive/string',
                                        },
                                        value: 'initialValue',
                                        label: 'strVar',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'initialValue',
                                    type: ConditionStatementType.Value,
                                    value: 'initialValue',
                                },
                            },
                        ],
                        operator: PredicateOperator.Every,
                    },
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                value: 'click',
                            },
                        },
                    ],
                },
            ],
            blur: [
                {
                    filter: {
                        conditions: [
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'field.text',
                                        name: 'field.text',
                                        label: 'text',
                                        type: 'string',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'meetMe',
                                    type: ConditionStatementType.Value,
                                    value: 'meetMe',
                                },
                            },
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                                        name: 'variable.strVar',
                                        type: 'string',
                                        model: {
                                            $ref: '#/$defs/primitive/string',
                                        },
                                        value: 'initialValue',
                                        label: 'strVar',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'otherValue',
                                    type: ConditionStatementType.Value,
                                    value: 'otherValue',
                                },
                            },
                        ],
                        operator: PredicateOperator.Some,
                    },
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                value: 'blur',
                            },
                        },
                    ],
                },
            ],
            select: [
                {
                    filter: {
                        conditions: [
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'field.text',
                                        name: 'field.text',
                                        label: 'text',
                                        type: 'string',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'doNotMeetMe',
                                    type: ConditionStatementType.Value,
                                    value: 'doNotMeetMe',
                                },
                            },
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                                        name: 'variable.strVar',
                                        type: 'string',
                                        model: {
                                            $ref: '#/$defs/primitive/string',
                                        },
                                        value: 'initialValue',
                                        label: 'strVar',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    display: 'otherValue',
                                    type: ConditionStatementType.Value,
                                    value: 'otherValue',
                                },
                            },
                        ],
                        operator: PredicateOperator.None,
                    },
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                value: 'select',
                            },
                        },
                    ],
                },
            ],
            focus: [
                {
                    filter: {
                        conditions: [
                            {
                                left: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'field.text',
                                        name: 'field.text',
                                        label: 'text',
                                        type: 'string',
                                    },
                                },
                                operator: ConditionOperator.EQ,
                                right: {
                                    type: ConditionStatementType.Variable,
                                    value: {
                                        id: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                                        name: 'variable.strVar',
                                        type: 'string',
                                        model: {
                                            $ref: '#/$defs/primitive/string',
                                        },
                                        value: 'initialValue',
                                        label: 'strVar',
                                    },
                                },
                            },
                        ],
                        operator: PredicateOperator.Every,
                    },
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                value: 'conditionNotMet',
                                display: true,
                                required: false,
                            },
                        },
                    ],
                },
            ],
            change: [
                {
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                disabled: true,
                                required: true,
                            },
                        },
                    ],
                },
            ],
            focusin: [
                {
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                display: false,
                            },
                        },
                    ],
                },
            ],
            focusout: [
                {
                    actions: [
                        {
                            target: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                            payload: {
                                value: '${field.text}',
                            },
                        },
                    ],
                },
            ],
            input: [
                {
                    actions: [
                        {
                            target: 'field.text',
                            payload: {
                                value: '${variable.strVar}',
                            },
                        },
                    ],
                },
            ],
            invalid: [
                {
                    actions: [
                        {
                            target: 'variable.be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                            payload: {
                                value: 'updatedValue',
                            },
                        },
                    ],
                },
            ],
        },
    },
};

export const getFormDefinitionMock = () => {
    const formDefinitionMock = {
        id: 'form-4fc8fa1d-2b67-424d-9b61-46f76425aee1',
        name: 'all-rules',
        description: '',
        version: 0,
        standAlone: true,
        tabs: [],
        fields: [
            {
                id: '0a12a423-733d-4cda-9a9f-a5e7a35ce864',
                name: 'Label',
                type: 'container',
                tab: null,
                numberOfColumns: 2,
                fields: {
                    '1': [
                        {
                            id: 'text',
                            name: 'text',
                            type: 'text',
                            readOnly: false,
                            required: false,
                            colspan: 1,
                            rowspan: 1,
                            placeholder: null,
                            minLength: 0,
                            maxLength: 0,
                            regexPattern: null,
                            visibilityCondition: null,
                            params: {
                                existingColspan: 1,
                                maxColspan: 2,
                            },
                            value: 'meetMe',
                        },
                    ],
                    '2': [],
                },
            },
        ],
        outcomes: [],
        metadata: {},
        variables: [
            {
                id: 'be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
                name: 'strVar',
                type: 'string',
                model: {
                    $ref: '#/$defs/primitive/string',
                },
                value: 'initialValue',
            },
        ],
        rules: formRulesMock,
    };

    return formDefinitionMock;
};

export const formRepresentationConditionLeftOnly = {
    id: 'form-bcdc54ba-c887-406f-aa59-aeb1dfa0ad9f',
    name: 'rules',
    description: '',
    version: 0,
    standAlone: true,
    tabs: [],
    fields: [
        {
            id: '74add4a6-0fd5-4e1a-bac6-75b114688dd7',
            name: 'Label',
            type: 'container',
            tab: null,
            numberOfColumns: 2,
            fields: {
                '1': [
                    {
                        id: 'text',
                        name: 'Text',
                        type: 'text',
                        readOnly: false,
                        required: false,
                        colspan: 1,
                        rowspan: 1,
                        placeholder: null,
                        minLength: 0,
                        maxLength: 0,
                        regexPattern: null,
                        visibilityCondition: null,
                        params: {
                            existingColspan: 1,
                            maxColspan: 2,
                        },
                    },
                ],
                '2': [
                    {
                        id: 'multiline',
                        name: 'Multiline text',
                        type: 'multi-line-text',
                        readOnly: false,
                        colspan: 1,
                        rowspan: 1,
                        placeholder: null,
                        minLength: 0,
                        maxLength: 0,
                        regexPattern: null,
                        required: false,
                        visibilityCondition: null,
                        params: {
                            existingColspan: 1,
                            maxColspan: 2,
                        },
                    },
                ],
            },
        },
    ],
    outcomes: [],
    metadata: {},
    variables: [
        {
            id: 'be49d2fe-ebfb-4fc2-8d0d-a47b0d73a43b',
            name: 'strVar',
            type: 'string',
            model: {
                $ref: '#/$defs/primitive/string',
            },
            value: 'initialValue',
        },
    ],
    rules: {
        fields: {
            text: {
                click: [
                    {
                        actions: [
                            {
                                target: 'field.multiline',
                                payload: {
                                    value: '${variable.strVar}',
                                },
                            },
                        ],
                    },
                ],
                input: [
                    {
                        filter: {
                            conditions: [
                                {
                                    left: {
                                        type: 'VARIABLE',
                                        value: {
                                            id: 'field.text',
                                            name: 'field.text',
                                            label: 'Text',
                                            type: 'string',
                                        },
                                    },
                                    operator: null,
                                    right: {
                                        type: 'EXPRESSION',
                                        value: null,
                                        display: '',
                                    },
                                },
                            ],
                            operator: 'every',
                        },
                        actions: [
                            {
                                target: 'field.multiline',
                                payload: {
                                    value: '${field.text}',
                                },
                            },
                        ],
                    },
                ],
            },
        },
    },
};
