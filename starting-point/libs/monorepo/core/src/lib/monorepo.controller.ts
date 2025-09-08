/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProjectMetadata } from './project-metadata';
import { WorkspaceConfig } from './workspace-config';
import { MissingProjectMetadataError, ProjectMetadataIO } from './project-metadata-io';
import { ProjectConfiguration } from '@nx/devkit';

class NonExistingProjectError extends Error {}

export class MonorepoController {
    static async getMonorepoProjectAsync(projectName: string): Promise<ProjectMetadata> {
        await MonorepoController.ensureProjectExist(projectName);
        return ProjectMetadataIO.load(projectName);
    }

    static async getStandaloneProjects(): Promise<ProjectMetadata[]> {
        const workspaceConfig = WorkspaceConfig.get();
        const projectNames = await workspaceConfig.getProjectNames();

        const projects = await Promise.all(
            projectNames.map(async (projectName) => {
                try {
                    return await ProjectMetadataIO.load(projectName);
                } catch (error) {
                    if (error instanceof MissingProjectMetadataError) {
                        return { isStandalone: () => false } as ProjectMetadata;
                    } else {
                        throw error;
                    }
                }
            })
        );

        return projects.filter((monorepoProject) => monorepoProject.isStandalone());
    }

    static async getDeployableProjects(): Promise<ProjectMetadata[]> {
        const workspaceConfig = WorkspaceConfig.get();
        const projectNames = await workspaceConfig.getProjectNames();

        const projects = await Promise.all(
            projectNames.map(async (projectName) => {
                try {
                    return await ProjectMetadataIO.load(projectName);
                } catch (error) {
                    if (error instanceof MissingProjectMetadataError) {
                        return { isDeployable: () => false } as ProjectMetadata;
                    } else {
                        throw error;
                    }
                }
            })
        );

        return projects.filter((monorepoProject) => monorepoProject.isDeployable());
    }

    private static async ensureProjectExist(projectName: string): Promise<ProjectConfiguration> {
        const config = WorkspaceConfig.get();
        const workspaceProjectData = await config.getProject(projectName);
        if (!workspaceProjectData) {
            throw new NonExistingProjectError(`Project (${projectName}) doesn't exist in workspace file`);
        }
        return workspaceProjectData;
    }
}
