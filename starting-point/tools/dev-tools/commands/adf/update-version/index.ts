/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, ConfirmParam, InputParam, Runnable } from '../../../../shared/command';
import { execSync } from 'node:child_process';
import { MonorepoController } from '@alfresco-dbp/monorepo/core';

const libs = [
    '@alfresco/adf-cli',
    '@alfresco/adf-core',
    '@alfresco/adf-content-services',
    '@alfresco/adf-extensions',
    '@alfresco/adf-process-services-cloud',
];

@Command({
    name: 'update-version',
    description: `Updates the versions of ADF dependencies and js-api library`,
})
export default class UpdateCommand implements Runnable {
    @InputParam({ required: false, alias: 'v', title: 'The new version of the ADF libraries, can also be alpha | beta | latest' })
    adfVersion = 'alpha';

    @InputParam({ required: false, alias: 'j', title: 'To use a different version of js-api, can also be alpha | beta | latest' })
    jsApiVersion = 'alpha';

    @ConfirmParam({ required: false, alias: 'u', title: `Do you want to skip updating js-api..?` })
    skipJsApi = false;

    async run() {
        console.log('Updating @alfresco dependencies');
        const projectsWithPackageJson = await this.getProjectsWithPackageJson();
        await this.updateLibraries(projectsWithPackageJson);
    }

    async updateLibraries(projectsWithPackageJson: string[]) {
        const libsWithVersions = this.getVersionedLibraries().join(' ');

        for (const standaloneProjectRootPath of projectsWithPackageJson) {
            process.chdir(standaloneProjectRootPath);
            execSync(`npm i --ignore-scripts -E ${libsWithVersions}`, { stdio: 'inherit' });
        }
    }

    private getVersionedLibraries(): string[] {
        const libsWithVersions = libs.map((lib) => `${lib}@${this.adfVersion}`);
        if (!this.skipJsApi) {
            libsWithVersions.push(`@alfresco/js-api@${this.jsApiVersion}`);
        }

        return libsWithVersions;
    }

    private async getProjectsWithPackageJson(): Promise<string[]> {
        const projects = await MonorepoController.getStandaloneProjects();
        const paths = projects.map((project) => project.standaloneProjectRootPath);
        return ['.', ...paths];
    }
}
