/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, GroupApi } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { logError } from '../../utils/axios-utils';
export class GroupServiceApi {
    private groupApi: GroupApi;

    constructor(private configuration: Configuration) {
        this.groupApi = new GroupApi(this.configuration);
    }

    getGroupId(groupName: string): Promise<string> {
        return this.groupApi
            .searchGroups(groupName)
            .then((res: any) => (res.data.length > 0 ? res.data[0].id : undefined))
            .catch((error: any) => logError('Error in searchGroups()', error));
    }
}
