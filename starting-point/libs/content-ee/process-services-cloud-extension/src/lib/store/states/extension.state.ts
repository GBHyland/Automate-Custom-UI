/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel } from '@alfresco/adf-process-services-cloud';

export interface ProcessServiceCloudExtensionState {
    health: boolean;
    application: string;
    selectedFilter: ProcessManagementFilterPayload;
    filtersThatCanBeRefreshed: {
        [key: string]: boolean;
    };
}
export const initialProcessServicesCloudExtensionState: ProcessServiceCloudExtensionState = {
    health: false,
    application: '',
    selectedFilter: {
        type: null,
        filter: null,
    },
    filtersThatCanBeRefreshed: {},
};

export enum FilterType {
    TASK = 'TASK',
    PROCESS = 'PROCESS',
}
export interface ProcessManagementFilterPayload {
    type: FilterType;
    filter: FilterParamsModel;
}
