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
import { HXP_FILES_TO_BE_IGNORED, HXP_PACKAGE_PATTERNS_TO_BE_EXCLUDED } from './ignored-files';
import { HXP_IN_REPO_PACKAGES } from './in-repo-packages';
import { transformStringInFile, TransformStringInFileConfig } from '../../transformers/transform-string-in-file';
import { calculateAffectedPackages } from '../calculate-affected-packages';

export const HXP_WORKSPACE_RELATED_PACKAGES: WorkspaceRelatedPackage[] = [
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
        workspaceConfigRegex: [/libs\/shared-hxp.*/],
        tsConfigRegex: [/@hxp\/shared-hxp.*/],
    },
    {
        workspaceConfigRegex: [/^shared-form-rules$/],
        tsConfigRegex: [/@alfresco-dbp\/shared-form-rules\/\*/, /@alfresco-dbp\/shared-form-rules/],
    },
    {
        workspaceConfigRegex: [/shared-features/],
        tsConfigRegex: [/@features/],
    },
    {
        workspaceConfigRegex: [/^satori-like-styles$/],
        tsConfigRegex: [/@hxp\/shared\/satori-like-styles/],
    },
    {
        workspaceConfigRegex: [/^workspace-hxp(?!.*(?:e2e|playwright)).*$/],
        tsConfigRegex: [/.*workspace-hxp(?!.*(?:e2e|playwright)).*$/, /@alfresco-dbp\/workspace-hxp.*/],
    },
    {
        workspaceConfigRegex: [/content-ee-process-services-cloud-extension/],
        tsConfigRegex: [/@alfresco\/adf-process-services-cloud-extension/],
    },
    {
        workspaceConfigRegex: [/shared-hxp.*/],
        tsConfigRegex: [/@hxp\/shared-hxp.*/],
    },
    {
        workspaceConfigRegex: [/shared.*/],
        tsConfigRegex: [/@hxp\/shared.*/],
    },
    {
        tsConfigRegex: [/@plugins/],
    },
    {
        workspaceConfigRegex: [/^shared-plugins$/],
        tsConfigRegex: [/^@hyland\/extend/],
    },
    {
        tsConfigRegex: [/@hyland\/idp-document-viewer/],
    },
];

export const HXP_TRANSFORMED_FILES_TO_BE_INCLUDED: FilePathWithTransformer[] = [
    {
        name: 'apps/workspace-hxp/project.json',
        transformer: transformProjectConfig,
        transformerConfig: {
            workspaceRelatedPackages: HXP_WORKSPACE_RELATED_PACKAGES,
            allowedTargetOptions: ['prebuild', 'build-esbuild', 'build', 'preserve', 'serve', 'test', 'lint', 'zip', 'pack-build', 'stylelint'],
            inRepoPackages: HXP_IN_REPO_PACKAGES,
        },
    },
    {
        name: 'config/contexts.json5',
        transformer: () => '{}',
    },
    {
        name: 'apps/workspace-hxp/project.variables.json5',
        transformer: transformJson5Files,
        transformerConfig: {
            variablesToUpdate: [
                {
                    key: 'APP_CONFIG_OAUTH2_SCOPE',
                    value: '{context.scope}',
                },
                {
                    key: 'HXP_INTELLIGENT_DOCUMENT_PROCESSING_URL',
                    value: undefined,
                },
                {
                    key: 'APP_CONFIG_GOVERNANCE_HOST',
                    value: undefined,
                },
                {
                    key: 'NUCLEUS_API_HOST',
                    value: undefined,
                },
            ],
        } as TransformProjectVariablesConfig,
    },
    {
        name: 'apps/workspace-hxp/src/app.config.json.tpl',
        transformer: transformStringInFile,
        transformerConfig: {
            from: '"hxIdpHost": "${HXP_INTELLIGENT_DOCUMENT_PROCESSING_URL}",',
            to: '"hxIdpHost": "",',
        } as TransformStringInFileConfig,
    },
    {
        name: 'package.json',
        transformer: transformPackageJson,
        transformerConfig: {
            packageName: 'workspace-hxp',
            packageDescription: 'Workspace HxP Application',
            updatePackageJsonLock: true,
            packageJsonSkipDependencies: HXP_PACKAGE_PATTERNS_TO_BE_EXCLUDED,
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
            packageName: 'workspace-hxp',
        } as TransformPackageLockJsonConfig,
    },
    {
        name: 'tsconfig.base.json',
        transformer: transformTsConfig,
        transformerConfig: HXP_WORKSPACE_RELATED_PACKAGES,
    },
    {
        name: 'tsconfig.adf.json',
        transformer: transformTsConfig,
        transformerConfig: HXP_WORKSPACE_RELATED_PACKAGES,
    },
    {
        name: 'nx.json',
        transformer: transformNxConfig,
    },
];

export const HXP_FILES_TO_BE_INCLUDED: ProjectFilePathToBeExtracted[] = [
    ...HXP_TRANSFORMED_FILES_TO_BE_INCLUDED,
    ...calculateAffectedPackages('workspace-hxp'),
    '.private-packages/**',
    'scripts/utils/validate-app-config.js',
    'libs/plugins/index.ts',
    'libs/shared-hxp/**',
    'libs/shared/satori-like-styles/**',
    'tools/jest.config.ts', // TODO: Needs to remove/review this
    'tools/shared/**',
    'tools/executors/*',
    'tools/executors/build-apps/*',
    'tools/monorepo/*',
    'tools/monorepo/commands/secrets/**',
    'tools/monorepo/commands/setenv/**',
    'tools/monorepo/commands/zip/**',
    'libs/shared/plugins/**',
    '.gitignore',
    'runany.js',
    '.nxignore',
    '.nvmrc',
    'apps/workspace-hxp/.nvmrc',
    {
        name: 'jest.config.ts',
        globOptions: {
            nodir: false,
            silent: false,
        },
    },
    {
        name: 'libs/monorepo/**',
        globOptions: {
            nodir: false,
            silent: false,
        },
    },
    {
        name: 'tools/**',
        globOptions: {
            ignore: HXP_FILES_TO_BE_IGNORED,
            nodir: true,
            silent: false,
        },
    },
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
