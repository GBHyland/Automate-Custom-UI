/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, CheckInApi } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { logError } from '../../utils/axios-utils';

export class CheckInServiceApi {
    private checkInApi: CheckInApi;

    constructor(private configuration: Configuration) {
        this.checkInApi = new CheckInApi(this.configuration);
    }

    async checkInDocument(documentId: string): Promise<void> {
        return this.checkInApi.checkin(documentId, true, 'default').catch((error: any) => logError('Error in checkInDocument()', error));
    }
}
