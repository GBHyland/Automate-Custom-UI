/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, DocumentApi, DownloadApi } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { DocumentServiceApi } from './services/content-service/document-service-api';
import { UploadServiceApi } from './services/content-service/upload-service-api';
import { QueryServiceApi } from './services/content-service/query-service-api';
import { GroupServiceApi } from './services/content-service/group-service-api';
import { CheckInServiceApi } from './services/content-service/check-in-service-api';
import { UserServiceApi } from './services/content-service/user-service-api';
import { Page } from '@playwright/test';
import { getAuthToken } from 'scripts/utils/get-auth-token';

export const validateResponse = async (page: Page, endpoint: string, expectedStatus: number) => {
    const response = await page.waitForResponse((resp) => resp.url().endsWith(endpoint));
    const status = response.status();
    const responseText = await response.text();

    if (status !== expectedStatus) {
        const statusText = response.statusText();
        throw new Error(`Request to "${endpoint}" failed with status ${status} (${statusText}): ${responseText}`);
    }

    return JSON.parse(responseText);
};

export class HxprApi {
    configuration: Configuration;
    documentApi: DocumentApi;
    downloadApi: DownloadApi;
    documentServiceApi!: DocumentServiceApi;
    queryServiceApi!: QueryServiceApi;
    uploadServiceApi!: UploadServiceApi;
    groupServiceApi!: GroupServiceApi;
    checkInServiceApi!: CheckInServiceApi;
    userServiceApi!: UserServiceApi;
    accessToken = '';

    async initialize(): Promise<HxprApi> {
        this.configuration = new Configuration({
            basePath: process.env['APP_CONFIG_ECM_HOST'],
            accessToken: await getAuthToken(),
        });
        this.downloadApi = new DownloadApi(this.configuration);
        this.documentServiceApi = new DocumentServiceApi(this.configuration);
        this.queryServiceApi = new QueryServiceApi(this.configuration);
        this.uploadServiceApi = new UploadServiceApi(this.configuration);
        this.groupServiceApi = new GroupServiceApi(this.configuration);
        this.checkInServiceApi = new CheckInServiceApi(this.configuration);
        this.userServiceApi = new UserServiceApi(this.configuration);
        return this;
    }
}
