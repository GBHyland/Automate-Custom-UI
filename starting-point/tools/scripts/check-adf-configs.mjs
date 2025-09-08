#!/usr/bin/env node

import { exit } from 'node:process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { styleText } from 'node:util';
import { createProjectGraphAsync, readProjectsConfigurationFromProjectGraph } from '@nx/devkit';

const ROOT_TS_CONFIG_FILE = 'tsconfig.base.json';
const ROOT_ADF_TS_CONFIG_FILE = 'tsconfig.adf.json';

const PROJECT_EXCLUSION_LIST = [
    // Following e2es are just wrappers
    'admin-apa-playwright-e2e',
    'admin-hxp-playwright-e2e',
    'content-ee-apa-playwright-e2e',
    'hxviewer-hxp-playwright-e2e',
    'studio-apa-playwright-e2e',
    'studio-hxp-playwright-e2e',
    'workspace-hxp-playwright-e2e',

    // Following are utility projects
    'tools',
    'monorepo-core',
    'monorepo-builders',
    'monorepo-utils',
    'shared-unit-testing',
];

function readJsonFile(filePath) {
    try {
        const content = readFileSync(resolve(process.cwd(), filePath), 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading or parsing file: ${filePath}`, error);
        throw error;
    }
}

class MissingConfigError extends Error {
    constructor(message) {
        super(message);
    }
}

async function getProjectConfigs() {
    const projectGraph = await createProjectGraphAsync();
    if (!projectGraph) {
        throw new Error('Project graph is undefined or null');
    }
    return readProjectsConfigurationFromProjectGraph(projectGraph);
}

function getProjectTargets(config, projectBlackList) {
    const allowedTargets = new Set(['build', 'test', 'e2e']);
    const projects = config.projects;

    return Object.keys(projects)
        .filter((projectName) => !projectBlackList.includes(projectName) && projects[projectName].targets)
        .map((projectName) => ({
            projectName,
            projectRootPath: projects[projectName].root,
            targets: Object.keys(projects[projectName].targets)
                .filter((targetName) => allowedTargets.has(targetName))
                .map((targetName) => ({
                    targetName,
                    ...projects[projectName].targets[targetName],
                })),
        }))
        .filter(({ targets }) => targets.length > 0)
        .flatMap(({ projectName, projectRootPath, targets }) =>
            targets.map((target) => ({
                projectName,
                projectRootPath,
                ...target,
            }))
        );
}

async function checkWorkspaceConfig() {
    const configs = await getProjectConfigs();
    const projectTargets = getProjectTargets(configs, PROJECT_EXCLUSION_LIST);
    const projectsWithMissingConfiguration = projectTargets
        .filter((project) => !project.targetName.includes('e2e'))
        .filter((project) => !project?.configurations?.adf);

    if (projectsWithMissingConfiguration.length > 0) {
        for (const projectTarget of projectsWithMissingConfiguration) {
            const message = styleText('red', `${projectTarget.projectName}:${projectTarget.targetName} is missing configuration for ADF.`);
            console.log(message);
        }
        throw new MissingConfigError('💩 Workspace contains one or more projects with missing ADF configuration.');
    }
}

async function checkRootTsConfigFile() {
    const baseConfig = readJsonFile(ROOT_TS_CONFIG_FILE);
    const baseAdfConfig = readJsonFile(ROOT_ADF_TS_CONFIG_FILE);

    const basePathMappings = Object.keys(baseConfig.compilerOptions.paths);
    const baseAdfPathMappings = Object.keys(baseAdfConfig.compilerOptions.paths);

    const missingPathMappings = basePathMappings.filter((alias) => !baseAdfPathMappings.includes(alias));

    if (missingPathMappings.length > 0) {
        for (const alias of missingPathMappings) {
            const message = styleText('red', `Alias for ${alias} is not present in ${ROOT_ADF_TS_CONFIG_FILE}.`);
            console.log(message);
        }
        throw new Error(`The necessary path mappings between ${ROOT_TS_CONFIG_FILE} and ${ROOT_ADF_TS_CONFIG_FILE} differ.`);
    }
}

async function main() {
    let workspaceConfigError = false;
    try {
        console.log(`Checking if ${ROOT_ADF_TS_CONFIG_FILE} is configured correctly...`);
        await checkWorkspaceConfig();
    } catch (error) {
        if (error instanceof MissingConfigError) {
            workspaceConfigError = true;
            console.error(error.message);
        } else {
            throw error;
        }
    }

    await checkRootTsConfigFile();

    const exitCode = +workspaceConfigError;
    if (exitCode) {
        console.error(styleText('red', 'ADF configuration check failed.'));
    } else {
        console.log(styleText('green', 'ADF configuration check passed.'));
    }
    exit(exitCode);
}

main().catch((error) => {
    console.error(styleText('red', `${error.message}`));
    exit(1);
});
