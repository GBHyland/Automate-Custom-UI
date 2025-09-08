/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UnitTestRunner } from '@nx/angular/generators';
import { ProjectConfiguration, Tree, readProjectConfiguration, updateProjectConfiguration } from '@nx/devkit';
import { NormalizedSchema } from '../models/normalized-schema';
import { TestConfiguration } from '../models/test-configuration';

export function editLibraryProjectJson(tree: Tree, options: NormalizedSchema) {
    const currentProjectConfig = readProjectConfiguration(tree, options.projectName);
    const testConfiguration = options.unitTestRunner === UnitTestRunner.Jest ? getJestConfiguration() : getKarmaConfiguration();
    const { targets } = currentProjectConfig;

    targets['stylelint'] = {};
    targets['build'] = {
        ...targets['build'],
        configurations: {
            production: {
                tsConfig: `{projectRoot}/tsconfig.lib.prod.json`,
            },
            development: {
                tsConfig: `{projectRoot}/tsconfig.lib.json`,
            },
            adf: {
                tsConfig: `{projectRoot}/tsconfig.lib.adf.json`,
            },
        },
    };

    const project: ProjectConfiguration & { prefix: string } = {
        ...currentProjectConfig,
        prefix: options.prefix,
        targets: { ...targets, ...testConfiguration },
        tags: options.parsedTags,
    };

    updateProjectConfiguration(tree, options.projectName, project);
    return project;
}

function getJestConfiguration(): TestConfiguration {
    return {
        test: {
            executor: '@nx/jest:jest',
            options: {
                jestConfig: `{projectRoot}/jest.config.ts`,
                passWithNoTests: true,
            },
            configurations: {
                adf: {
                    jestConfig: `{projectRoot}/jest.adf.config.ts`,
                    codeCoverage: false,
                    silent: true,
                },
            },
        },
    };
}

function getKarmaConfiguration(): TestConfiguration {
    return {
        test: {
            executor: '@angular-devkit/build-angular:karma',
            options: {
                codeCoverage: true,
                main: `{projectRoot}/src/test.ts`,
                tsConfig: `{projectRoot}/tsconfig.spec.json`,
                karmaConfig: `{projectRoot}/karma.conf.js`,
                stylePreprocessorOptions: {
                    includePaths: ['libs/shared/core/src/styles'],
                },
            },
            configurations: {
                adf: {
                    tsConfig: `{projectRoot}/tsconfig.spec.adf.json`,
                    karmaConfig: `{projectRoot}/karma.conf.js`,
                    progress: false,
                    codeCoverage: false,
                    stylePreprocessorOptions: {
                        includePaths: ['libs/shared/core/src/styles', '../alfresco-ng2-components/lib/core/src/lib'],
                    },
                },
            },
        },
    };
}
