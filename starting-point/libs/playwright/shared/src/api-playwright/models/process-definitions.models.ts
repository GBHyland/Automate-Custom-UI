/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CustomAPIRequest } from '../context-factory';

export interface ProcessDefinitionsType {
    list: {
        entries: ProcessDefinitionCloud[];
    };
}

export interface ProcessDefinitionsEndpointParameters {
    context: CustomAPIRequest;
    serviceUrl: string;
    admin?: boolean;
}

export interface ProcessDefinitionCloud {
    entry: {
        appVersion: string;
        appName: string;
        serviceName: string;
        serviceFullName: string;
        serviceType: string;
        serviceVersion: string;
        id: string;
        name: string;
        key: string;
        version: number;
        formKey?: string;
        category: string;
        variableDefinitions: [];
    };
}
