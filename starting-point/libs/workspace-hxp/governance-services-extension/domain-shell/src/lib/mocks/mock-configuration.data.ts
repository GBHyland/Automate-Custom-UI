/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const mockConfigEndpointData = [
    {
        environmentDataSourceDTO: {
            createdByUser: null,
            createdAt: null,
            modifiedByUser: null,
            modifiedAt: null,
            name: 'Production',
            description: null,
            type: null,
            dataSourceId: null,
            repoUrl: null,
            id: 'EDS#3456',
        },
        filePlans: [
            {
                createdByUser: null,
                createdAt: '2025-03-03T07:15:14Z',
                modifiedByUser: null,
                modifiedAt: '2025-03-03T07:15:14Z',
                id: 'FP#1234',
                name: 'File Plan HR',
                description: 'File Plan HR',
                key: null,
                datasource: {
                    createdByUser: null,
                    createdAt: null,
                    modifiedByUser: null,
                    modifiedAt: null,
                    name: 'Production',
                    description: null,
                    type: null,
                    dataSourceId: null,
                    repoUrl: null,
                    id: 'EDS#3456',
                },
                categories: [
                    {
                        createdByUser: null,
                        createdAt: '2025-03-03T07:15:14Z',
                        modifiedByUser: null,
                        modifiedAt: '2025-03-03T07:15:14Z',
                        name: 'Retention Category HR APAC',
                        description: 'Retention Category HR APAC',
                        inheritParentRetention: null,
                        retentionPolicy: {
                            name: null,
                            description: null,
                            contentFocus: null,
                            triggerCondition: {
                                immediate: false,
                                propertyBased: "myCustomProperty='signed'",
                                eventBased: '',
                            },
                            retentionPeriod: null,
                            disposition: {
                                action: 'PURGE',
                            },
                        },
                        contentFocus: {
                            createdByUser: null,
                            createdAt: null,
                            modifiedByUser: null,
                            modifiedAt: null,
                            contentType: 'Invoice',
                        },
                        id: '4567',
                        categories: [
                            {
                                createdByUser: null,
                                createdAt: '2025-03-03T07:15:14Z',
                                modifiedByUser: null,
                                modifiedAt: '2025-03-03T07:15:14Z',
                                name: 'Retention Category HR EU',
                                description: 'Retention Category HR EU',
                                inheritParentRetention: null,
                                retentionPolicy: {
                                    name: null,
                                    description: null,
                                    contentFocus: null,
                                    triggerCondition: {
                                        immediate: false,
                                        propertyBased: "myCustomProperty='signed'",
                                        eventBased: '',
                                    },
                                    retentionPeriod: null,
                                    disposition: {
                                        action: 'PURGE',
                                    },
                                },
                                contentFocus: {
                                    createdByUser: null,
                                    createdAt: null,
                                    modifiedByUser: null,
                                    modifiedAt: null,
                                    contentType: 'Invoice',
                                },
                                id: '7654',
                                categories: null,
                            },
                        ],
                    },
                    {
                        createdByUser: null,
                        createdAt: '2025-03-03T07:15:14Z',
                        modifiedByUser: null,
                        modifiedAt: '2025-03-03T07:15:14Z',
                        name: 'Sub Retention Category HR EU',
                        description: 'Retention Category HR EU',
                        inheritParentRetention: null,
                        retentionPolicy: {
                            name: null,
                            description: null,
                            contentFocus: null,
                            triggerCondition: {
                                immediate: false,
                                propertyBased: "myCustomProperty='signed'",
                                eventBased: '',
                            },
                            retentionPeriod: null,
                            disposition: {
                                action: 'PURGE',
                            },
                        },
                        contentFocus: {
                            createdByUser: null,
                            createdAt: null,
                            modifiedByUser: null,
                            modifiedAt: null,
                            contentType: 'Invoice',
                        },
                        id: '7655',
                        categories: null,
                    },
                ],
                filePlanType: 'RETENTION',
            },
            {
                createdByUser: null,
                createdAt: '2025-03-03T07:15:14Z',
                modifiedByUser: null,
                modifiedAt: '2025-03-03T07:15:14Z',
                id: 'LFP#4565',
                name: 'Legal Hold File Plan EU',
                description: '\t Legal Hold File Plan EU',
                key: null,
                datasource: {
                    createdByUser: null,
                    createdAt: null,
                    modifiedByUser: null,
                    modifiedAt: null,
                    name: 'Production',
                    description: null,
                    type: null,
                    dataSourceId: null,
                    repoUrl: null,
                    id: 'EDS#3456',
                },
                categories: null,
                filePlanType: 'LEGAL_HOLD',
            },
        ],
    },
];
