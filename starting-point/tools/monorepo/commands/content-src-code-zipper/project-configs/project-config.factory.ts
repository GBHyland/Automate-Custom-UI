/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SupportedProject } from '../transformers/file-transformer.interface';
import { InRepoPackageConfig, ProjectFilePathToBeExtracted } from './interfaces';
import { APA_PRIVATE_PACKAGES } from './content-ee-apa/private-packages';
import { APA_FILES_TO_BE_INCLUDED, APA_TRANSFORMED_FILES_TO_BE_INCLUDED } from './content-ee-apa/project-files';
import { APA_FILES_TO_BE_IGNORED, APA_PACKAGE_PATTERNS_TO_BE_EXCLUDED } from './content-ee-apa/ignored-files';
import { HXP_PRIVATE_PACKAGES } from './workspace-hxp/private-packages';
import { HXP_FILES_TO_BE_INCLUDED, HXP_TRANSFORMED_FILES_TO_BE_INCLUDED } from './workspace-hxp/project-files';
import { HXP_FILES_TO_BE_IGNORED, HXP_PACKAGE_PATTERNS_TO_BE_EXCLUDED } from './workspace-hxp/ignored-files';
import { HXP_IN_REPO_PACKAGES } from './workspace-hxp/in-repo-packages';
import { APA_IN_REPO_PACKAGES } from './content-ee-apa/in-repo-packages';

export class ProjectConfigFactory {
    constructor(private extractProject?: SupportedProject) {}

    getProjectPrivatePackages(): string[] {
        if (this.extractProject === SupportedProject.WorkspaceHxp) {
            return HXP_PRIVATE_PACKAGES;
        }

        return APA_PRIVATE_PACKAGES;
    }

    getProjectInRepoPackages(): InRepoPackageConfig[] {
        if (this.extractProject === SupportedProject.WorkspaceHxp) {
            return HXP_IN_REPO_PACKAGES;
        }

        return APA_IN_REPO_PACKAGES;
    }

    getExclusionPackagePatterns() {
        if (this.extractProject === SupportedProject.WorkspaceHxp) {
            return HXP_PACKAGE_PATTERNS_TO_BE_EXCLUDED;
        }

        return APA_PACKAGE_PATTERNS_TO_BE_EXCLUDED;
    }

    getProjectConfig(): ProjectFilePathToBeExtracted[] {
        if (this.extractProject === SupportedProject.WorkspaceHxp) {
            return HXP_FILES_TO_BE_INCLUDED;
        }

        return APA_FILES_TO_BE_INCLUDED;
    }

    getProjectIgnoredFiles(): string[] {
        /**
         * Transformer files are appended into the archive.
         * Since we are also adding files using archive.glob (e.g. 'apps/workspace-hxp/**'),
         * it can result in duplicate files on Windows machines.
         * We need to exclude transformer files to avoid having them twice in the archive.
         */

        if (this.extractProject === SupportedProject.WorkspaceHxp) {
            const HXP_TRANSFORMER_FILES_TO_BE_IGNORED = HXP_TRANSFORMED_FILES_TO_BE_INCLUDED.map((file) => file.name);
            return [...HXP_FILES_TO_BE_IGNORED, ...HXP_TRANSFORMER_FILES_TO_BE_IGNORED];
        }

        const APA_TRANSFORMER_FILES_TO_BE_IGNORED = APA_TRANSFORMED_FILES_TO_BE_INCLUDED.map((file) => file.name);
        return [...APA_FILES_TO_BE_IGNORED, ...APA_TRANSFORMER_FILES_TO_BE_IGNORED];
    }
}
