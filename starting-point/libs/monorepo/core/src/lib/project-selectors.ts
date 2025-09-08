/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { WorkspaceConfig } from './workspace-config';

interface Project {
    name: string;
    projectType?: string;
    [key: string]: any;
}

async function getProjects(): Promise<Project[]> {
    const config = new WorkspaceConfig();
    const projectNames = await config.getProjectNames();

    return Promise.all(
        projectNames.map(async (projectName) => {
            const project = await config.getProject(projectName);
            return {
                name: projectName,
                ...project,
            };
        })
    );
}

export async function getApps(): Promise<Project[]> {
    const projects = await getProjects();
    return projects.filter((project) => project.projectType === 'application').filter((project) => !project.name.includes('e2e'));
}
