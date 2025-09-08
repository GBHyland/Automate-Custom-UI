/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, InputParam, ListParam, Runnable } from '../../../shared/command';
import { SupportedProject } from './transformers/file-transformer.interface';
import { ProjectConfigFactory } from './project-configs/project-config.factory';
import { PrivatePackageCreator } from './steps/private-packages-creator';
import { InRepoPackageCreator } from './steps/in-repo-packages-creator';
import { PackageRegistryUpdater } from './steps/package-registry-updater';
import { SourceCodeZipper } from './steps/source-code-zipper';
import { join } from 'node:path';
import { InRepoPackageConfig, ProjectFilePathToBeExtracted } from './project-configs/interfaces';

@Command({
    name: 'content-src-code-zipper',
    description: `Extract the archived source code for content apps`,
})
export default class SourceCodeZipperCommand implements Runnable {
    projectConfig: ProjectConfigFactory;

    @InputParam({
        required: false,
        alias: 'o',
        title: 'Enter the output path. (default: ./content-app.zip)',
    })
    output = join(process.cwd(), 'content-app.zip');

    @ListParam({
        required: false,
        alias: 'e',
        title: `Change extracted project. Default ${SupportedProject.ContentApa}`,
        choices: [{ name: SupportedProject.ContentApa }, { name: SupportedProject.WorkspaceHxp }],
    })
    extractProject: SupportedProject = SupportedProject.ContentApa;

    async run() {
        const workspaceRoot = process.cwd();
        this.projectConfig = new ProjectConfigFactory(this.extractProject);

        console.log('Inline private packages');
        await this.inlinePrivateNpmDependencies(workspaceRoot, this.projectConfig.getProjectPrivatePackages());

        const inRepoPackages = this.projectConfig.getProjectInRepoPackages();
        if (inRepoPackages && inRepoPackages.length > 0) {
            console.log('Inline in-repo packages');
            await this.inlineInRepoNpmDependencies(workspaceRoot, inRepoPackages);
        }

        console.log('Update npm dependencies from wrong registry');
        await this.updateNpmDependenciesFromWrongRegistry(workspaceRoot, this.projectConfig.getExclusionPackagePatterns());

        console.log('Zipping the Content app(s) related files');
        await this.zipSourceCode(this.projectConfig.getProjectConfig(), this.projectConfig.getProjectIgnoredFiles());
    }

    async inlinePrivateNpmDependencies(workspaceRoot: string, packages: string[]): Promise<void> {
        const privatePackageCreator = new PrivatePackageCreator();
        privatePackageCreator.extractPackages(workspaceRoot, packages);
    }

    async inlineInRepoNpmDependencies(workspaceRoot: string, inRepoPackages: InRepoPackageConfig[]): Promise<void> {
        const privatePackageCreator = new InRepoPackageCreator();
        return privatePackageCreator.extractPackages(workspaceRoot, inRepoPackages);
    }

    async updateNpmDependenciesFromWrongRegistry(workspaceRoot: string, ignore: string[]): Promise<void> {
        const packageRegistryUpdater = new PackageRegistryUpdater();
        packageRegistryUpdater.updatePackageRegistry(workspaceRoot, ignore);
    }

    async zipSourceCode(include: ProjectFilePathToBeExtracted[], ignore: string[]) {
        const sourceCodeZipper = new SourceCodeZipper();
        return sourceCodeZipper.zipCode(this.output, include, ignore);
    }
}
