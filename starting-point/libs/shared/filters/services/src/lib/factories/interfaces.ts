/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ProcessDefinitionCloud,
    ProcessFilterCloudModel,
    ProcessVariableDefinition,
    ProcessVariableFilterModel,
} from '@alfresco/adf-process-services-cloud';

/**
 * For specific filters, we need to save some additional data.
 * For example, for a date filter, we need to save the date range such as 'WEEK', 'MONTH', 'QUARTER', etc.
 * This data would be hard and error-prone to infer from the filter model itself.
 */
export interface ProcessVariableFilterModelExtension<T = unknown> extends ProcessVariableFilterModel {
    data?: T;
}

export interface ProcessFilterCloudModelExtension extends ProcessFilterCloudModel {
    processVariableFilters?: ProcessVariableFilterModelExtension[];
}

export interface VariableByProcess {
    variable: ProcessVariableDefinition;
    process: ProcessDefinitionCloud;
}
