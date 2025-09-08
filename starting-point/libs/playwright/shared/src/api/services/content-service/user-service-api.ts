/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, UserApi, User } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { logError } from '../../utils/axios-utils';
export class UserServiceApi {
    private userApi: UserApi;

    constructor(private configuration: Configuration) {
        this.userApi = new UserApi(this.configuration);
    }

    getUserDetailsByName(userName: string): Promise<User> {
        return this.userApi
            .searchUsersByName(userName)
            .then((res: any) => (res.data.length > 0 ? res.data[0] : undefined))
            .catch((error: any) => logError('Error in getUserDetailsByName()', error));
    }
}
