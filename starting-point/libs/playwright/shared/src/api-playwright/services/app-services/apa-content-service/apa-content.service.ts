/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../base.service';
import { CustomAPIRequest, NodeData } from '../../..';
import { NodesEndpoint, SearchEndpoint, SitesEndpoint } from './endpoints';

export class ApaContentService extends BaseService {
    serviceUrl = '/alfresco/api/-default-/public';
    nodes: NodesEndpoint;
    search: SearchEndpoint;
    sites: SitesEndpoint;

    constructor(context: CustomAPIRequest) {
        super(context);
        this.nodes = new NodesEndpoint(context, this.serviceUrl);
        this.search = new SearchEndpoint(context, this.serviceUrl);
        this.sites = new SitesEndpoint(context, this.serviceUrl);
    }

    async createFolderIfNotExists(parentFolderId: string | '-my-', folderName: string): Promise<NodeData | RequestResponse> {
        const folders = await this.search.getNodeByName(folderName);

        return folders.list.entries.length > 0 ? folders.list.entries[0] : this.nodes.createFolder(parentFolderId, folderName);
    }
}
