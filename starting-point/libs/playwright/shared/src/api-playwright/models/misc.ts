/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DeployParams } from './deployment-service';

export interface TestApplication {
    testApplication: TestApplicationDescriptor;
    name: string;
}

export interface TestApplicationDescriptor {
    name: string;
    path: () => string;
    deployPayload: (params: Pick<DeployParams, 'name' | 'projectId' | 'releaseId'>, environmentId?: string) => any;
    projectDetails?: any;
    processes?: {
        [key: string]: string | Partial<ProcessesDetails>;
    };
}

interface ProcessesDetails {
    name: string;
    processDefinitionKey: string;
    variables: any[];
}

export interface RetryMessage {
    level?: 'info' | 'error' | 'warn' | 'debug';
    waitingMessage?: string;
    errorMessage?: string;
}

export interface RenditionsConfiguration {
    renditions: {
        renditionId: string;
        targetMimetype?: string;
        options?: { name: string; value: string }[];
    }[];
}

export interface Pagination {
    skipCount: number;
    maxItems: number;
    count: number;
    hasMoreItems: boolean;
    totalItems: number;
}

export interface ACSErrorResponse {
    error: {
        errorKey: string;
        statusCode: number;
        briefSummary: string;
        stackTrace: string;
        descriptionURL: string;
    };
}
