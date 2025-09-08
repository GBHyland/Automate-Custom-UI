/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../../base.service';
import { CustomAPIRequest } from '../../../';

export class RolesEndpoint extends BaseService {
    private baseEndpoint: string;
    private rolesEndpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.baseEndpoint = serviceUrl;
        this.rolesEndpoint = `${this.baseEndpoint}/roles`;
    }

    async getRoleIdByRoleName(roleName: string): Promise<string> {
        const roles = await this.get(this.rolesEndpoint);
        for (const role in roles) {
            if (roles[role].name === roleName) {
                return roles[role].id;
            }
        }

        return undefined;
    }
}
