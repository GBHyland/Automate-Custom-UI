/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DOCUMENT_MOCK } from './document.mock';

export const mockedForm = {
    formRepresentation: {
        id: 'form-115a9ebf-bb12-4b54-a7f4-6e183fca9193',
        name: 'attach',
        key: 'attach-ojy5n',
        description: '',
        version: 0,
        formDefinition: {
            tabs: [],
            fields: [
                {
                    id: 'fb0de794-3ea3-4e5e-8e58-da3efbbca547',
                    name: 'Label',
                    type: 'container',
                    tab: null,
                    numberOfColumns: 1,
                    fields: {
                        '1': [
                            {
                                id: 'attachFile',
                                name: 'Attach file',
                                type: 'hxp-upload',
                                readOnly: false,
                                required: false,
                                colspan: 1,
                                rowspan: 1,
                                visibilityCondition: null,
                                params: {
                                    existingColspan: 1,
                                    maxColspan: 2,
                                    fileSource: {
                                        name: 'HxP Content and Local',
                                        serviceId: 'all-file-sources',
                                        destinationFolderPath: {
                                            value: '/',
                                            type: 'static',
                                        },
                                    },
                                    multiple: true,
                                    link: false,
                                    menuOptions: {
                                        show: true,
                                        download: true,
                                        remove: true,
                                    },
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
                    id: '331c1dac-62b3-42e6-9cc0-2b74846822eb',
                    name: 'stringVar',
                    type: 'string',
                    model: {
                        $ref: '#/$defs/primitive/string',
                    },
                    value: DOCUMENT_MOCK.sys_path,
                },
                {
                    id: '3e6894c4-49c2-4b51-bc7d-34dec0cbef53',
                    name: 'contentVarById',
                    type: 'content',
                    model: {
                        $ref: '#/$defs/primitive/content',
                    },
                },
                {
                    id: 'fd079c5c-e502-4484-9250-c8bd51bf9365',
                    name: 'contentVarByPath',
                    type: 'content',
                    model: {
                        $ref: '#/$defs/primitive/content',
                    },
                },
            ],
        },
    },
};
