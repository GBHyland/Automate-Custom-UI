/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, QueryApi, Document } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { logError } from '../../utils/axios-utils';

export class QueryServiceApi {
    private queryApi: QueryApi;

    constructor(private configuration: Configuration) {
        this.queryApi = new QueryApi(this.configuration);
    }

    async getDocumentsByQuery(query: string): Promise<Document[]> {
        return this.queryApi
            .getDocumentsByQuery({ query })
            .then((res: any) => res.data.documents)
            .catch((error: any) => logError('Error in getDocumentsByQuery()', error));
    }
}
