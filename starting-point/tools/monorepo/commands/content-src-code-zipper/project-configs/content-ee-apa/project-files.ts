/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { WorkspaceRelatedPackage } from '../../types';
import { transformNxConfig } from '../../transformers/transform-nx-config';
import { PackageJsonTransformerData, transformPackageJson } from '../../transformers/transform-package-json';
import { transformPackageLockJson, TransformPackageLockJsonConfig } from '../../transformers/transform-package-lock-json';
import { transformJson5Files, TransformProjectVariablesConfig } from '../../transformers/transform-json5';
import { transformTsConfig } from '../../transformers/transform-tsconfig';
import { transformProjectConfig } from '../../transformers/transform-workspace-config';
import { FilePathWithTransformer, ProjectFilePathToBeExtracted } from '../interfaces';
import { APA_FILES_TO_BE_IGNORED, APA_PACKAGE_PATTERNS_TO_BE_EXCLUDED } from './ignored-files';
import { calculateAffectedPackages } from '../calculate-affected-packages';

const CONTENT_EE_RELATED_PACKAGES: WorkspaceRelatedPackage[] = [
    {
        workspaceConfigRegex: [],
        tsConfigRegex: [/^package\.json$/],
    },
    {
        workspaceConfigRegex: [/^tools$/],
        tsConfigRegex: [/^@alfresco-dbp\/tools.*/],
    },
    {
        workspaceConfigRegex: [/^monorepo.*/],
        tsConfigRegex: [],
    },
    {
        workspaceConfigRegex: [/^shared$/],
        tsConfigRegex: [/@alfresco-dbp\/shared\/\*/, /@alfresco-dbp\/shared/],
    },
    {
        workspaceConfigRegex: [/^shared-form-rules$/],
        tsConfigRegex: [/@alfresco-dbp\/shared-form-rules\/\*/, /@alfresco-dbp\/shared-form-rules/],
    },
    {
        workspaceConfigRegex: [/^content-ee(?!.*(?:e2e|playwright|testing)).*$/],
        tsConfigRegex: [/@alfresco-dbp\/content-ee.*/, /@alfresco\/.*/],
    },
    {
        workspaceConfigRegex: [/shared-features/],
        tsConfigRegex: [/@features/],
    },
    {
        tsConfigRegex: [/@plugins/],
    },
    {
        workspaceConfigRegex: [/^shared-plugins$/],
        tsConfigRegex: [/^@hyland\/extend/],
    },
];

export const APA_TRANSFORMED_FILES_TO_BE_INCLUDED: FilePathWithTransformer[] = [
    {
        name: 'apps/content-ee-apa/project.json',
        transformer: transformProjectConfig,
        transformerConfig: {
            workspaceRelatedPackages: CONTENT_EE_RELATED_PACKAGES,
            allowedTargetOptions: ['prebuild', 'build-esbuild', 'build', 'preserve', 'serve', 'test', 'lint', 'zip', 'pack-build', 'stylelint'],
        },
    },
    {
        name: 'config/contexts.json5',
        transformer: () => '{}',
    },
    {
        name: 'apps/content-ee-apa/project.variables.json5',
        transformer: transformJson5Files,
        transformerConfig: {
            variablesToUpdate: [
                {
                    key: 'APP_CONFIG_OAUTH2_SCOPE',
                    value: '{context.scope}',
                },
            ],
        } as TransformProjectVariablesConfig,
    },
    {
        name: 'tsconfig.base.json',
        transformer: transformTsConfig,
        transformerConfig: CONTENT_EE_RELATED_PACKAGES,
    },
    {
        name: 'tsconfig.adf.json',
        transformer: transformTsConfig,
        transformerConfig: CONTENT_EE_RELATED_PACKAGES,
    },
    {
        name: 'nx.json',
        transformer: transformNxConfig,
    },
    {
        name: 'package.json',
        transformer: transformPackageJson,
        transformerConfig: {
            packageName: 'content-ee-apa',
            packageDescription: 'Alfresco Content EE Applications',
            packageJsonSkipDependencies: APA_PACKAGE_PATTERNS_TO_BE_EXCLUDED,
            updatePackageJsonLock: true,
            packageJsonScripts: [
                'ng',
                'postinstall',
                'build-monorepo-tools',
                'setup-monorepo',
                'build',
                'start',
                'lint',
                'test',
                'setenv',
                'mr',
                'pack-build',
            ],
        } as PackageJsonTransformerData,
    },
    {
        name: 'package-lock.json',
        transformer: transformPackageLockJson,
        transformerConfig: {
            packageName: 'content-ee-apa',
        } as TransformPackageLockJsonConfig,
    },
];

export const APA_FILES_TO_BE_INCLUDED: ProjectFilePathToBeExtracted[] = [
    ...APA_TRANSFORMED_FILES_TO_BE_INCLUDED,
    ...calculateAffectedPackages('content-ee-apa'),
    {
        name: 'libs/monorepo/**',
        globOptions: { nodir: false, silent: false },
    },
    {
        name: 'tools/**',
        globOptions: {
            ignore: APA_FILES_TO_BE_IGNORED,
            nodir: true,
            silent: false,
        },
    },
    {
        name: 'jest.config.ts',
        globOptions: {
            nodir: false,
            silent: false,
        },
    },
    '.private-packages/**',
    'scripts/utils/validate-app-config.js',
    'developer-docs/apps/content-ee/**',
    'docs/compatibility-matrix.md',
    'libs/shared/plugins/**',
    'libs/plugins/index.ts',
    'tools/jest.config.ts', // TODO: Needs to remove/review this
    'tools/shared/**',
    'tools/executors/*',
    'tools/executors/build-apps/*',
    'tools/monorepo/*',
    'tools/monorepo/commands/secrets/**',
    'tools/monorepo/commands/setenv/**',
    'tools/monorepo/commands/zip/**',
    '.gitignore',
    'runany.js',
    '.nxignore',
    '.nvmrc',
    'jest.preset.js',
    'karma.conf.js',
    'license-header.txt',
    'tsconfig.json',
    'proxy-helpers.js',
    'README.md',
    'developer-docs/local-development/env-setup.md',
    'developer-docs/local-development/plugins-generators.md',
    'developer-docs/local-development/assets/plugin-structure-with-translations.png',
    'developer-docs/local-development/assets/plugin-structure-without-translations.png',
];
