/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HandleRuleEventOnProcessFinishData } from '../services/interfaces';

export const handleRuleEventOnProcessFinishDataMock: HandleRuleEventOnProcessFinishData = {
    process: {
        correlationKey: 'correlation-key',
        processInstanceId: 'process-instance-id',
        variable: {
            processVariable: {
                id: 1,
                name: 'processVariable',
                appName: 'app-name',
                processDefinitionKey: 'fetch-data',
                createTime: 'create-time',
                lastUpdatedTime: '',
                markedAsDeleted: false,
                processInstanceId: 'process-instance-id',
                serviceFullName: '',
                serviceName: '',
                serviceVersion: '',
                taskVariable: false,
                type: '',
                value: 'process-value',
                variableDefinitionId: '',
            },
        },
    },
} as const;
