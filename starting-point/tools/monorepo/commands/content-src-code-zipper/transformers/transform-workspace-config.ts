/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { WorkspaceRelatedPackage } from '../types';
import { FileTransformer } from './file-transformer.interface';
import { readFileSync, writeFileSync } from 'node:fs';

export const transformProjectConfig: FileTransformer = (
    name,
    config: {
        workspaceRelatedPackages: WorkspaceRelatedPackage[];
        allowedTargetOptions: string[];
        inRepoPackages?: {
            package: string;
            path: string;
        }[];
    }
) => {
    const rawProjectConfig = readFileSync(name);
    const projectConfig = JSON.parse(rawProjectConfig.toString());

    if (!projectConfig.targets) {
        return JSON.stringify(projectConfig, undefined, 2);
    }

    const targets: any = {};
    for (const projectTargetName of Object.keys(projectConfig.targets)) {
        if (config.allowedTargetOptions.includes(projectTargetName)) {
            targets[projectTargetName] = projectConfig.targets[projectTargetName];
        }
    }

    if (config.inRepoPackages && targets.build?.options?.assets) {
        targets.build.options.assets = updateAssetsPath(config.inRepoPackages, targets.build.options.assets);
    }

    projectConfig.targets = targets;

    const implicitDependencies = projectConfig.implicitDependencies;
    if (implicitDependencies) {
        projectConfig.implicitDependencies = implicitDependencies.filter((dependency: string) =>
            filterWorkspaceProjects(dependency, config.workspaceRelatedPackages)
        );
    }

    const rawResults = JSON.stringify(projectConfig, undefined, 2);
    writeFileSync(name, rawResults);
    return rawResults;
};

function filterWorkspaceProjects(projectName: string, projectRelatedPackages: WorkspaceRelatedPackage[]): boolean {
    return projectRelatedPackages
        .filter((regexes) => regexes?.workspaceConfigRegex?.length)
        .flatMap((regexes) => regexes.workspaceConfigRegex)
        .some((regex) => regex.test(projectName));
}

/**
 * The repo contains libraries that can be published to remote registries as packages.
 * This function updates assets paths (usually coming from project.json build target) with the node_modules reference to the same installed lib.
 *
 * @param inRepoPackages - An array of in-repo packages with their paths and package names.
 *  The path is the path to the in-repo package in the workspace.
 * @param assets - An array of assets to update, which can be either strings or objects with input, glob, and output properties.
 * @returns An array of updated assets with the input paths replaced with a node_modules reference to the same installed package.
 *
 * eg:
 *  {
 *      lib: 'adf-enterprise-adf-hx-content-services',
 *      package: '@alfresco/adf-hx-content-services',
 *      path: 'libs/adf/enterprise/adf-hx-content-services'
 *  }
 * will update the assets paths from: libs/adf/enterprise/adf-hx-content-services[/whatever] (path property)
 * to node_modules/@alfresco/adf-hx-content-services[/whatever] (package property)
 *
 */
function updateAssetsPath(
    inRepoPackages: Array<{ path: string; package: string }>,
    assets: Array<{ input: string; glob?: string; output: string } | string>
) {
    const pathsToUpdate = inRepoPackages.map((inRepoPackage) => inRepoPackage.path);
    return assets.map((asset) => {
        if (typeof asset === 'string') {
            return asset;
        }
        const index = pathsToUpdate.findIndex((path) => asset.input.startsWith(path));
        if (index !== -1) {
            asset.input = asset.input.replace(pathsToUpdate[index], `node_modules/${inRepoPackages[index].package}`);
        }
        return asset;
    });
}
