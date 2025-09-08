/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../../base.service';
import { CustomAPIRequest, Options } from '../../../';
import { Roles } from './';

export class GroupsEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/groups`;
    }

    async deleteGroup(groupId: string): Promise<any> {
        return this.delete(`${this.endpoint}/${groupId}`);
    }

    async createGroup(groupName: string): Promise<any> {
        const requestOptions: Options = {
            data: {
                name: groupName,
            },
        };

        return this.post(this.endpoint, requestOptions);
    }

    async getGroups(groupName: string): Promise<any> {
        const requestOptions: Options = {
            params: {
                search: groupName,
            },
        };

        return this.get(this.endpoint, requestOptions);
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
