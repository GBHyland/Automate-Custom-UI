/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../base.service';
import { CustomAPIRequest } from '../..';
import { GroupsEndpoint, Roles, RolesEndpoint, UsersEndpoint } from './';

export class IdentityService extends BaseService {
    private serviceUrl = '/auth/admin/realms/alfresco';

    users: UsersEndpoint;
    roles: RolesEndpoint;
    groups: GroupsEndpoint;

    constructor(context: CustomAPIRequest) {
        super(context);
        this.users = new UsersEndpoint(context, this.serviceUrl);
        this.roles = new RolesEndpoint(context, this.serviceUrl);
        this.groups = new GroupsEndpoint(context, this.serviceUrl);
    }

    async createUserWithRole(username: string, identityRole?: Roles): Promise<any> {
        await this.users.createIdentityUser(username);
        const [user] = await this.users.getUsers(username);

        if (identityRole) {
            const roleId = await this.roles.getRoleIdByRoleName(identityRole);
            await this.users.assignRole(user.id, roleId, identityRole);
        }

        return user;
    }

    async createGroupWithRole(groupName: string, identityRole: Roles): Promise<any> {
        await this.groups.createGroup(groupName);
        const [group] = await this.groups.getGroups(groupName);

        const roleId = await this.roles.getRoleIdByRoleName(identityRole);
        await this.groups.assignRole(group.id, roleId, identityRole);

        return group;
    }
}
