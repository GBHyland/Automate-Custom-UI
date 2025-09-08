/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import { CustomAPIRequest, Options, SiteData } from '../../../..';

export class SitesEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/alfresco/versions/1/sites`;
    }

    async createSiteIfNotExists(
        siteName: string,
        visibility: 'PUBLIC' | 'PRIVATE' | 'MODERATED',
        description?: string
    ): Promise<SiteData | RequestResponse> {
        try {
            await this.createSite(siteName, visibility, description);
        } catch {}

        return this.getSite(siteName);
    }

    async createSite(siteName: string, visibility: 'PUBLIC' | 'PRIVATE' | 'MODERATED', description?: string): Promise<SiteData | RequestResponse> {
        const requestOptions: Options = {
            data: {
                title: siteName,
                id: siteName,
                visibility: visibility,
                description: description ?? '',
            },
        };

        return this.post(`${this.endpoint}`, requestOptions);
    }

    async getSite(siteName: string): Promise<SiteData | RequestResponse> {
        return this.get(`${this.endpoint}/${siteName}`);
    }

    async deleteSite(siteId: string): Promise<RequestResponse> {
        return this.delete(`${this.endpoint}/${siteId}`);
    }
}
