/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { join } from 'node:path';
import { ProjectConfiguration, ProjectsConfigurations, createProjectGraphAsync, readProjectsConfigurationFromProjectGraph } from '@nx/devkit';
import type { WorkspaceProjectsLike } from './monorepo.interfaces';
import { readFileSync } from 'node:fs';

let instance: WorkspaceConfig;

export class WorkspaceConfig {
    private workspaces: ProjectsConfigurations;

    /** @deprecated */
    get version(): number {
        return this.workspaces.version;
    }

    /** @deprecated */
    get schema(): string {
        return './node_modules/nx/schemas/nx-schema.json';
    }

    static get() {
        if (!instance) {
            instance = new WorkspaceConfig();
        }

        return instance;
    }

    async getProjects(): Promise<WorkspaceProjectsLike> {
        if (!this.workspaces) {
            const projectGraph = await createProjectGraphAsync();
            if (!projectGraph) {
                throw new Error('Project graph is undefined or null');
            }
            this.workspaces = readProjectsConfigurationFromProjectGraph(projectGraph);
        }

        return this.workspaces.projects;
    }

    async getProject(projectName: string): Promise<ProjectConfiguration> {
        const projects = await this.getProjects();
        return projects[projectName];
    }

    async getProjectNames(): Promise<string[]> {
        const projects = await this.getProjects();
        return Object.keys(projects);
    }

    getPackageJsonPath(): string {
        return join(process.cwd(), 'package.json');
    }

    getPackageJson(): Record<string, any> {
        const packageJsonPath = this.getPackageJsonPath();
        return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    }
}
