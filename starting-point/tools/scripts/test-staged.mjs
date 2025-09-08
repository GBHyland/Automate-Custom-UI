#! /usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { styleText } from 'node:util';
import { exit } from 'node:process';
import { createProjectGraphAsync, readProjectsConfigurationFromProjectGraph } from '@nx/devkit';

const DEFAULT_TEST_CONFIG = 'jest.config.ts';
const DEFAULT_KARMA_CONFIG = 'karma.conf.js';

async function main() {
    const program = new Command();
    program
        .name('test-staged')
        .description('Run tests on staged files')
        .action(async () => {
            const files = getStagedFiles();
            if (files.length === 0) {
                console.info(styleText('yellow', `Warning: There are no staged files to test.`));
                exit(0);
            }

            console.log(`Running tests on staged files...`);
            const result = await runTests(files);
            if (result) {
                console.info(styleText('green', 'All tests passed!'));
                exit(0);
            } else {
                console.error(styleText('red', 'Some tests failed!'));
                exit(1);
            }
        });

    program.parse(process.argv);
}

async function runTests(files) {
    const workspaceProjects = await getProjects();
    // Only for ninjas: Regex negative lookbehind 🥷
    const filteredFiles = files.filter((file) => /(?<!config)\.[tj]s$/.test(file));

    return getGroupedFilesWithConfig(filteredFiles, workspaceProjects, findAppropriateUnitTestConfigForFile)
        .filter((testDetails) => !testDetails.configFile.includes('karma'))
        .map((details) => unitTest(details))
        .every((result) => result === true);
}

function unitTest(testingJobDetails) {
    console.info('Files to unit test:');
    console.info(testingJobDetails.files.join('\n'));
    try {
        execSync(
            `npx jest --coverage=false --findRelatedTests --passWithNoTests -c ${testingJobDetails.configFile} ${testingJobDetails.files.join(' ')}`,
            { stdio: 'inherit' }
        );
        return true;
    } catch {
        return false;
    }
}

function getStagedFiles() {
    const files = execSync('git diff --cached --name-only --diff-filter=d').toString();
    return files ? files.split('\n').filter((file) => !!file) : [];
}

async function getProjects() {
    const projectGraph = await createProjectGraphAsync();
    if (!projectGraph) {
        throw new Error('Project graph is undefined or null');
    }

    const { projects } = readProjectsConfigurationFromProjectGraph(projectGraph);
    return projects;
}

function findAppropriateUnitTestConfigForFile(fileName, projects) {
    return (
        Object.keys(projects)
            .map((projectName) => {
                if (projects[projectName].targets?.test?.executor.indexOf(':karma') !== -1) {
                    return {
                        root: projects[projectName].root,
                        config: projects[projectName].targets?.test?.options?.karmaConfig || DEFAULT_KARMA_CONFIG,
                    };
                }
                return {
                    root: projects[projectName].root,
                    config: projects[projectName].targets?.test?.options?.jestConfig || DEFAULT_TEST_CONFIG,
                };
            })
            .find(({ root }) => fileName.includes(root))?.config || DEFAULT_TEST_CONFIG
    );
}

function getGroupedFilesWithConfig(files, projects, findConfig) {
    if (files.length === 0) {
        return [];
    }
    if (Object.keys(projects).length === 0) {
        throw new Error('Project Configuration is empty');
    }

    const configToFilesContainer = files
        .map((file) => ({ file, configFile: findConfig(file, projects) }))
        .reduce((acc, { file, configFile }) => {
            if (acc[configFile]) {
                acc[configFile].push(file);
            } else {
                acc[configFile] = [file];
            }
            return acc;
        }, {});

    return Object.entries(configToFilesContainer).map(([configFile, collectedFiles]) => ({ configFile, files: collectedFiles }));
}

main().catch(console.error);
