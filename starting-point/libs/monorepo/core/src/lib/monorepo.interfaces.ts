/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { type ProjectConfiguration } from '@nx/devkit';

export interface MonorepoProjectDeploy {
    releaseVersion: string;
    tagAliases: string[];
}

export interface MonorepoStandaloneProject {
    projectRoot: string;
}

export interface ProjectInfo {
    deploy?: MonorepoProjectDeploy;
    standalone?: MonorepoStandaloneProject;
    staticResources?: ProjectInfoStaticResources;
}

export interface ProjectInfoStaticResources {
    dockerFile: string;
    repositories: { repositorySlug: string; repositoryDomain: string }[];
}

export interface ProjectEnvironment {
    defaultContext: string;
    variables: Record<string, string | boolean | number | Array<any> | Record<string, any>>;
}

export interface ProjectMetadataJson extends ProjectInfo {
    environment?: ProjectEnvironment;
}

export interface WorkspaceProjectsLike {
    [projectName: string]: ProjectConfiguration;
}
