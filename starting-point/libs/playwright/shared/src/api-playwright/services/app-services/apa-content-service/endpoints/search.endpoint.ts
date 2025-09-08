/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import { ApiUtils, CustomAPIRequest, NodeDataEntry, Options, PaginatedList } from '../../../..';

export class SearchEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/search/versions/1/search`;
    }

    async getNodeByName(nodeName: string): Promise<PaginatedList | RequestResponse> {
        const requestOptions: Options = {
            data: {
                query: {
                    query: `((cm:name: "${nodeName}"))`,
                },
                paging: {
                    skipCount: 0,
                    maxItems: 25,
                },
                sort: [{ type: 'SCORE', field: 'score', ascending: false }],
            },
        };

        return this.post(this.endpoint, requestOptions);
    }

    async waitForNode(nodeName: string): Promise<NodeDataEntry> {
        const predicate = (result: NodeDataEntry) => !!result && result.name === nodeName;
        const apiCall = async () => (await this.getNodeByName(nodeName)).list.entries[0].entry;

        return ApiUtils.waitForApi(apiCall, predicate);
    }
}
