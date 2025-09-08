/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ApplicationsListResponse, Security, CustomAPIRequest } from '../../../';
import { BaseService, RequestResponse } from '../../base.service';

export class ApplicationsEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/v1/applications`;
    }

    async getDeployedApplicationsList(): Promise<ApplicationsListResponse | RequestResponse> {
        return this.get(`${this.endpoint}`);
    }

    async getApplicationByName(applicationName: string): Promise<any> {
        return this.get(`${this.endpoint}/${applicationName}`);
    }

    async getApplicationByDisplayName(displayName: string): Promise<any> {
        const applicationsList = await this.getDeployedApplicationsList();
        return applicationsList.list.entries.find((app) => app.entry.displayName === displayName).entry;
    }

    async setPermissions(
        appName: string,
        usersPermissions: Security,
        adminsPermissions: Security,
        managersPermissions: Security
    ): Promise<RequestResponse> {
        const body: Security[] = [
            {
                role: 'ACTIVITI_USER',
                groups: usersPermissions.groups,
                users: usersPermissions.users,
            },
            {
                role: 'ACTIVITI_ADMIN',
                groups: adminsPermissions.groups,
                users: adminsPermissions.users,
            },
            {
                role: 'APPLICATION_MANAGER',
                groups: managersPermissions.groups,
                users: managersPermissions.users,
            },
        ];

        return this.post(`${this.endpoint}/${appName}/security?environmentId=${process.env['APP_CONFIG_ENVIRONMENT_ID']}`, { data: body });
    }
}
