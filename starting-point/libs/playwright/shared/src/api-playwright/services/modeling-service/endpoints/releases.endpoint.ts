/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../base.service';
import { ReleaseDataEntry, ReleaseDataList, ReleaseQueryFilters, RetryMessage } from '../../../models';
import { ApiUtils } from '../../../utils';
import { CustomAPIRequest } from '../../../context-factory/context.models';

export class ReleasesEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/v1/releases`;
    }

    async deleteRelease(releaseId: string): Promise<void> {
        await this.delete(`${this.endpoint}/${releaseId}`);
    }

    async deleteReleases(releaseList: ReleaseDataEntry[]): Promise<RequestResponse> {
        const ReleaseIds = [];
        ReleaseIds.push(...releaseList.map((i) => i.id));

        return Promise.all(ReleaseIds.map((id) => this.deleteRelease(id)));
    }

    async deleteReleasesContainingName(projectName: string): Promise<RequestResponse> {
        const filters: Partial<ReleaseQueryFilters> = {
            projectName: projectName,
        };
        const projectsData = await this.getAllReleases(filters);
        const projectsDataEntries: ReleaseDataEntry[] = projectsData.list.entries.map((i) => i.entry);

        return this.deleteReleases(projectsDataEntries);
    }

    async getReleaseDetails(projectName: string): Promise<any> {
        const result = await this.get(`${this.endpoint}?projectName=${projectName}&sort=release.creationDate,desc`);
        return result?.list?.entries?.length > 0 ? result.list.entries[0].entry : undefined;
    }

    async getAllReleasesDetails(projectName: string): Promise<any[]> {
        const result = await this.get(`${this.endpoint}?projectName=${projectName}&showAllVersions=true`);
        return result?.list?.entries?.length > 0 ? result.list.entries.map((release) => release.entry) : [];
    }

    async getAllReleases(getReleaseFilters: Partial<ReleaseQueryFilters>): Promise<ReleaseDataList | RequestResponse> {
        getReleaseFilters = {
            maxItems: 1000,
            ...getReleaseFilters,
        };

        return this.get(`${this.endpoint}`, { params: getReleaseFilters });
    }

    async waitAndGetRelease(getReleaseFilters: Partial<ReleaseQueryFilters>): Promise<any> {
        const apiCall = async () => (await this.getAllReleases(getReleaseFilters)).list.entries.pop();
        const predicate = (result: any) => !!result;
        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for release ${JSON.stringify(getReleaseFilters)}`,
            errorMessage: `No release found by filters ${JSON.stringify(getReleaseFilters)} on the expected waiting time`,
        };

        return ApiUtils.waitForApi(apiCall, predicate, retryMessage);
    }
}
