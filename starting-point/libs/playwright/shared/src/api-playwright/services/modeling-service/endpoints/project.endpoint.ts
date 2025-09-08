/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../base.service';
import { ProjectCollaborator, ReleaseDataEntry, ReleaseDataList, ReleaseQueryFilters, ProjectData, ProjectDataEntry } from '../../../models';
import { UtilFile } from '../../../../utils';
import { CustomAPIRequest, ApiUtils } from '../../../';

export class ProjectsEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/v1/projects`;
    }

    async createProject(name: string, options?: { waitForResponse?: boolean }): Promise<ProjectData | RequestResponse> {
        const postBody = {
            configuration: {},
            name,
        };

        if (options?.waitForResponse === true) {
            const createdProject = await this.post(this.endpoint, { data: postBody });
            const project = async () => {
                const foundProjects = await this.searchProject(name);
                return foundProjects[0].entry.name === name ? Promise.resolve() : Promise.reject();
            };
            await ApiUtils.retryCall(project, 3);

            return createdProject;
        }

        return this.post(this.endpoint, { data: postBody });
    }

    async createMultipleProjects(projectNames: string[]): Promise<string[]> {
        const projects = [];

        for (const projectName of projectNames) {
            projects.push(await this.createProject(projectName));
        }
        return projects.map((i) => i.entry.id);
    }

    async addCollaborator(projectId: string, collaboratorName: string): Promise<ProjectCollaborator> {
        const query = `${projectId}/collaborators/${collaboratorName}`;

        return <Promise<ProjectCollaborator>>this.put(`${this.endpoint}/${query}`, { data: {} });
    }

    async deleteCollaborator(projectId: string, collaboratorName: string): Promise<any> {
        const query = `${projectId}/collaborators/${collaboratorName}`;

        return this.delete(`${this.endpoint}/${query}`, { data: {} });
    }

    async deleteProject(projectId: string): Promise<RequestResponse> {
        const query = `${projectId}`;

        return this.delete(`${this.endpoint}/${query}`);
    }

    async deleteProjects(projectList: ProjectDataEntry[]): Promise<RequestResponse> {
        const projectIds = [];
        projectIds.push(...projectList.map((i) => i.id));

        return Promise.all(projectIds.map((id) => this.deleteProject(id)));
    }

    async deleteProjectsContainingName(projectName: string): Promise<RequestResponse> {
        const projectsData = await this.searchProject(projectName);
        const projectsDataEntries: ProjectDataEntry[] = projectsData.map((i) => i.entry);

        return this.deleteProjects(projectsDataEntries);
    }

    async importProject(projectFilePath: string, name?: string): Promise<ProjectData | RequestResponse> {
        const fileContent = await UtilFile.getStreamFromFile(projectFilePath);

        const params = {
            multipart: {
                file: fileContent,
            },
        };

        if (name) {
            params.multipart['name'] = name;
        }

        return this.post(`${this.endpoint}/import`, params);
    }

    async releaseProject(projectId: string, name?: string): Promise<ReleaseDataEntry | RequestResponse> {
        const data = {};

        if (name) {
            data['name'] = name;
        }

        return this.post(`${this.endpoint}/${projectId}/releases`, { data });
    }

    async getReleaseByProjectId(projectId: string, getReleaseFilters: Partial<ReleaseQueryFilters>): Promise<ReleaseDataList | RequestResponse> {
        return this.get(`${this.endpoint}/${projectId}/releases`, { params: getReleaseFilters });
    }

    async searchProject(name: string): Promise<ProjectData[]> {
        const response = await this.get(`${this.endpoint}?name=${name}`);
        return response.list.entries;
    }

    async addToFavorites(projectId: string): Promise<RequestResponse> {
        return this.put(`${this.endpoint}/${projectId}/favorites`);
    }

    async importAndReleaseMultipleProjects(projectFilePath, projectNames: string[]): Promise<void> {
        for (const projectName of projectNames) {
            const { entry: project } = await this.importProject(projectFilePath, projectName);
            await this.releaseProject(project.id);
        }
    }
    async setReadOnlyModels(projectId: string, modelIds?: string[]): Promise<RequestResponse> {
        const data = { readonly: modelIds };
        return this.put(`${this.endpoint}/${projectId}/readonly`, { data });
    }
}
