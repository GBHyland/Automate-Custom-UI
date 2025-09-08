/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormRepresentation } from '@alfresco/adf-process-services-cloud';

export const mockFormRepresentationWithOutcome = {
    formRepresentation: {
        id: 'form-9f7168af-a8e0-444f-b0a0-7f5b43704a44',
        name: 'form',
        key: 'form-2hag9',
        description: '',
        version: 0,
        formDefinition: {
            tabs: [],
            fields: [
                {
                    id: '63a1cfe2-bd7f-464e-803e-c2c162b6a7c0',
                    name: 'Label',
                    type: 'container',
                    tab: null,
                    numberOfColumns: 2,
                    fields: {
                        '1': [
                            {
                                id: 'Text0y1hh7',
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
                            } as unknown,
                        ],
                        '2': [],
                    },
                },
            ],
            outcomes: [
                {
                    id: 'c5676ca7-8ad4-421c-9538-aaf8560bd5fc',
                    name: 'Option 1',
                },
                {
                    id: '48e9c1f8-50b9-4d2f-998c-7836c132986f',
                    name: 'Option 2',
                },
            ],
            metadata: {},
            variables: [],
        },
    } as unknown as FormRepresentation,
};

export const mockFormRepresentationWithNoOutcome = {
    formRepresentation: {
        id: 'form-9f7168af-a8e0-444f-b0a0-7f5b43704a44',
        name: 'form',
        key: 'form-2hag9',
        description: '',
        version: 0,
        formDefinition: {
            tabs: [],
            fields: [
                {
                    id: '63a1cfe2-bd7f-464e-803e-c2c162b6a7c0',
                    name: 'Label',
                    type: 'container',
                    tab: null,
                    numberOfColumns: 2,
                    fields: {
                        '1': [
                            {
                                id: 'Text0y1hh7',
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
                            } as unknown,
                        ],
                        '2': [],
                    },
                },
            ],
            outcomes: [],
            metadata: {},
            variables: [],
        },
    } as unknown as FormRepresentation,
};
