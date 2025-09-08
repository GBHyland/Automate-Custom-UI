/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CustomAPIRequest, ApplicationDataList } from '../../../../';
import { BaseService } from '../../../base.service';

export class ApplicationEndpoints extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `/${serviceUrl}/v1/applications`;
    }

    async getApplicationData(): Promise<ApplicationDataList> {
        return (await this.get(this.endpoint)).list;
    }
}
