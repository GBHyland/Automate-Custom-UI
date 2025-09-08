/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateCloudFilterType, ProcessFilterCloudModel } from '@alfresco/adf-process-services-cloud';

export class ProcessCloudFilterAdapter {
    appName: string;
    appVersion?: number | number[];
    processName: string;
    processInstanceId: string;
    initiator: string;
    status: string;
    sort: string;
    order: string;
    processDefinitionId: string;
    processDefinitionName?: string;
    processDefinitionKey: string;
    lastModified: Date;
    lastModifiedTo: Date;
    lastModifiedFrom: Date;
    startedDate: Date;
    completedDateType: DateCloudFilterType;
    startedDateType: DateCloudFilterType;
    suspendedDateType: DateCloudFilterType;
    _startFrom: string;
    _startTo: string;
    _completedFrom: string;
    _completedTo: string;
    _suspendedFrom: string;
    _suspendedTo: string;
    name: string;

    constructor(obj: ProcessFilterCloudModel) {
        this.appName = obj.appName || obj.appName === '' ? obj.appName : null;
        this.appVersion = obj.appVersion;
        this.processInstanceId = obj.processInstanceId || null;
        this.processName = obj.processName || null;
        this.initiator = obj.initiator;
        this.status = obj.status || null;
        this.sort = obj.sort || null;
        this.order = obj.order || null;
        this.processDefinitionId = obj.processDefinitionId || null;
        this.processDefinitionName = obj.processDefinitionName || null;
        this.processDefinitionKey = obj.processDefinitionKey || null;
        this.lastModified = obj.lastModified || null;
        this.lastModifiedTo = obj.lastModifiedTo || null;
        this.lastModifiedFrom = obj.lastModifiedFrom || null;
        this.startedDate = obj.startedDate || null;
        this._startFrom = obj.startFrom || null;
        this._startTo = obj.startTo || null;
        this.completedDateType = obj.completedDateType || null;
        this.startedDateType = obj.startedDateType || null;
        this.suspendedDateType = obj.suspendedDateType || null;
        this._completedFrom = obj.completedFrom || null;
        this._completedTo = obj.completedTo || null;
        this._suspendedFrom = obj.suspendedFrom || null;
        this._suspendedTo = obj.suspendedTo || null;
        this.name = obj.name || null;
    }
}
