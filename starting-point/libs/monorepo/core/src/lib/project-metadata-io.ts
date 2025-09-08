/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'node:path';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import type { ProjectEnvironment, ProjectInfo } from './monorepo.interfaces';
import { ProjectMetadata } from './project-metadata';
import { WorkspaceConfig } from './workspace-config';
import { Json5VariantMerger } from './json5-variant-merger';

export class MissingProjectMetadataError extends Error {}

export const MONOREPO_PROJECT_INFO_FILE = 'project.info.json';
const MONOREPO_PROJECT_VARIABLES_FILE = 'project.variables';

export class ProjectMetadataIO {
    static async load(projectName: string): Promise<ProjectMetadata> {
        const config = WorkspaceConfig.get();
        const workspaceProjectData = await config.getProject(projectName);

        const infoPath = ProjectMetadataIO.getInfoJsonPath(workspaceProjectData.root);
        const info: ProjectInfo = ProjectMetadataIO.loadFile(infoPath);

        const mergedEnvironment = Json5VariantMerger.read(
            resolve(process.cwd(), workspaceProjectData.root),
            MONOREPO_PROJECT_VARIABLES_FILE
        ) as ProjectEnvironment;

        return new ProjectMetadata(projectName, { ...info, environment: mergedEnvironment }, workspaceProjectData);
    }

    static persistInfo(projectMetadata: ProjectMetadata): void {
        const path = ProjectMetadataIO.getInfoJsonPath(projectMetadata.workspaceProject.root);
        const metadata = projectMetadata.metadata;
        delete metadata.environment;

        writeFileSync(path, JSON.stringify(metadata, undefined, 4));
    }

    private static loadFile<T>(filePath: string): T {
        if (existsSync(filePath)) {
            return JSON.parse(readFileSync(filePath, 'utf8')) as T;
        } else {
            throw new MissingProjectMetadataError(`Project's metadata shard, can't be found: ${filePath}`);
        }
    }

    private static getInfoJsonPath(projectRootPath: string, cwd = process.cwd()) {
        return resolve(cwd, projectRootPath, MONOREPO_PROJECT_INFO_FILE);
    }
}
