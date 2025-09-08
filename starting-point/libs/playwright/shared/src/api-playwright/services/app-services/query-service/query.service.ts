/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../base.service';
import { ActuatorHealthStatus, RetryMessage, CustomAPIRequest, ApiUtils } from '../../../';
import { UserTasksEndpoint, ServiceTasksEndpoint, ProcessInstanceEndpoint, ProcessDefinitionsEndpoint, ApplicationEndpoints } from './';
import { getApplicationNameWithEnv } from '../../../../';

interface ConstructorInputTypes {
    context: CustomAPIRequest;
    appName: string;
}

export class QueryService extends BaseService {
    serviceUrl: string;
    userTasks: UserTasksEndpoint;
    adminUserTasks: UserTasksEndpoint;
    adminServiceTasks: ServiceTasksEndpoint;
    adminProcessInstance: ProcessInstanceEndpoint;
    processInstance: ProcessInstanceEndpoint;
    adminProcessDefinitions: ProcessDefinitionsEndpoint;
    processDefinitions: ProcessDefinitionsEndpoint;
    application: ApplicationEndpoints;

    constructor({ context, appName }: ConstructorInputTypes) {
        super(context);
        this.serviceUrl = `${getApplicationNameWithEnv(appName)}/query`;
        this.userTasks = new UserTasksEndpoint(this.context, this.serviceUrl, false);
        this.processInstance = new ProcessInstanceEndpoint({ context, serviceUrl: this.serviceUrl, admin: false });
        this.application = new ApplicationEndpoints(this.context, this.serviceUrl);
        this.adminProcessInstance = new ProcessInstanceEndpoint({ context, serviceUrl: this.serviceUrl, admin: true });
        this.adminUserTasks = new UserTasksEndpoint(this.context, this.serviceUrl, true);
        this.adminServiceTasks = new ServiceTasksEndpoint(this.context, this.serviceUrl);
        this.adminProcessDefinitions = new ProcessDefinitionsEndpoint({ context, serviceUrl: this.serviceUrl, admin: true });
        this.processDefinitions = new ProcessDefinitionsEndpoint({ context, serviceUrl: this.serviceUrl, admin: false });
    }

    async getQueryActuatorHealthStatus(): Promise<ActuatorHealthStatus | RequestResponse> {
        return this.get(`${this.serviceUrl}/actuator/health`);
    }

    async waitForActuatorHealthStatus(status: string): Promise<ActuatorHealthStatus | RequestResponse> {
        const predicate = (result: ActuatorHealthStatus | RequestResponse) => !!result && result.status === status;
        const apiCall = async () => this.getQueryActuatorHealthStatus();

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for query service status to be '${status}'`,
            errorMessage: `The query service status '${status}' was not reached on the expected waiting time`,
        };

        return ApiUtils.waitForApi(apiCall, predicate, retryMessage);
    }
}
