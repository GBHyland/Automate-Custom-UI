/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../../base.service';
import { CustomAPIRequest, Options } from '../../../';
import { UtilRandom } from '../../../../';

export type Roles = 'ACTIVITI_USER' | 'ACTIVITI_ADMIN' | 'ACTIVITI_DEVOPS' | 'ACTIVITI_IDENTITY';

export class UsersEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/users`;
    }

    async createIdentityUser(username: string): Promise<void> {
        const randomEmail = `${UtilRandom.generateAlphaLowerCase(7)}@alfresco.com`;
        const requestOptions: Options = {
            data: {
                username: username,
                email: randomEmail,
                firstName: username,
                lastName: username,
                enabled: true,
            },
        };
        await this.post(this.endpoint, requestOptions);
    }

    async getUsers(username: string): Promise<any> {
        const requestOptions: Options = {
            params: {
                username: username,
            },
        };

        return this.get(this.endpoint, requestOptions);
    }

    async deleteUser(userId: string): Promise<void> {
        await this.delete(`${this.endpoint}/${userId}`);
    }

    async assignRole(entityId: string, roleId: string, roleName: Roles): Promise<any> {
        const mappingEndpoint = `${this.endpoint}/${entityId}/role-mappings/realm`;
        const requestOptions: Options = {
            data: [
                {
                    id: roleId,
                    name: roleName,
                },
            ],
        };

        return this.post(mappingEndpoint, requestOptions);
    }
}
