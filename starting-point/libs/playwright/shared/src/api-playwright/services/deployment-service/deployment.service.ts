/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../base.service';
import { CustomAPIRequest } from '../../';
import { ApplicationsEndpoint, EnvironmentsEndpoint, EnvironmentVariablesEndpoint } from './endpoints';
import { FeatureFlagsEndpoint } from '..';

export class DeploymentService extends BaseService {
    serviceUrl = '/deployment-service';
    applications: ApplicationsEndpoint;
    featureFlags: FeatureFlagsEndpoint;
    variables: EnvironmentVariablesEndpoint;
    environments: EnvironmentsEndpoint;

    constructor(context: CustomAPIRequest) {
        super(context);
        this.applications = new ApplicationsEndpoint(context, this.serviceUrl);
        this.featureFlags = new FeatureFlagsEndpoint(context, this.serviceUrl);
        this.variables = new EnvironmentVariablesEndpoint(context, this.serviceUrl);
        this.environments = new EnvironmentsEndpoint(context, this.serviceUrl);
    }
}
