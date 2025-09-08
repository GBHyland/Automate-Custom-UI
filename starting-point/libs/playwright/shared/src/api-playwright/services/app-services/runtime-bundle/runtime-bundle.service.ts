/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../base.service';
import { ActuatorHealthStatus, CustomAPIRequest, RetryMessage, ApiUtils } from '../../../';
import { ProcessInstancesEndpoint, TasksEndpoint, FormsEndpoint, RuntimeProcessDefinitionsEndpoint } from './';
import { getApplicationNameWithEnv } from '../../../../';
import { FeatureFlagsEndpoint } from '../..';

export class RuntimeBundleService extends BaseService {
    serviceUrl: string;
    processInstance: ProcessInstancesEndpoint;
    processDefinition: RuntimeProcessDefinitionsEndpoint;
    adminProcessInstance: ProcessInstancesEndpoint;
    tasks: TasksEndpoint;
    forms: FormsEndpoint;
    featureFlags: FeatureFlagsEndpoint;

    constructor(context: CustomAPIRequest, appName: string) {
        super(context);
        this.serviceUrl = `${getApplicationNameWithEnv(appName)}/rb`;
        this.processInstance = new ProcessInstancesEndpoint(context, this.serviceUrl, false);
        this.adminProcessInstance = new ProcessInstancesEndpoint(context, this.serviceUrl, true);
        this.tasks = new TasksEndpoint(context, this.serviceUrl);
        this.forms = new FormsEndpoint(context, getApplicationNameWithEnv(appName));
        this.featureFlags = new FeatureFlagsEndpoint(context, this.serviceUrl);
        this.processDefinition = new RuntimeProcessDefinitionsEndpoint({ context, serviceUrl: this.serviceUrl, admin: false });
    }

    async getRbActuatorHealthStatus(): Promise<ActuatorHealthStatus | RequestResponse> {
        return this.get(`${this.serviceUrl}/actuator/health`);
    }

    async waitForActuatorHealthStatus(status: string): Promise<ActuatorHealthStatus> {
        const predicate = (result: ActuatorHealthStatus | RequestResponse) => !!result && result.status === status;
        const apiCall = async () => {
            return this.getRbActuatorHealthStatus();
        };

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for runtime bundle status to be '${status}'`,
            errorMessage: `The runtime bundle status '${status}' was not reached on the expected waiting time`,
        };

        return ApiUtils.waitForApi(apiCall, predicate, retryMessage);
    }
}
