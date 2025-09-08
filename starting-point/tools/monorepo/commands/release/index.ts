/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { styleText } from 'node:util';
import { Command, Runnable, ConfirmParam, CommandInquirer, ListParam } from '../../../shared/command';
import { execSync } from 'node:child_process';
import { MonorepoController, ProjectMetadataIO } from '@alfresco-dbp/monorepo/core';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { incrementDBPVersion, ReleaseType } from './version-bumper';
import { CompatibilityMatrix } from './compatibility-matrix';

const noChangelogReleaseTypes = new Set([ReleaseType.patch, ReleaseType.prereleasepatch]);

@Command({
    name: 'release',
    description: `Create a new release for monorepo. Handles the different project version updates, ADF/js-api updates and release documents creation.`,
})
export default class ReleaseCommand implements Runnable {
    @ListParam({ required: false, alias: 'r', title: 'Release type', choices: Object.values(ReleaseType) })
    releaseType: ReleaseType = ReleaseType.patch;

    @ConfirmParam({ required: false, alias: 's', title: 'Update ADF and js-api versions' })
    updateAdf = true;

    private packageVersion: string;
    private licenseReadMePath = `${process.cwd()}/docs/license-info/README.md`;
    private vulnerabilityReadMePath = `${process.cwd()}/docs/vulnerabilities-info/README.md`;
    private changelogReadMePath = `${process.cwd()}/docs/changelog/README.md`;
    private inquirer: CommandInquirer;
    private adfTag: string;
    private jsApiTag: string;

    private get licenseRow() {
        return `- [${this.packageVersion}](license-info-${this.packageVersion}.md)`;
    }

    private get vulnerabilityRow() {
        return `- [${this.packageVersion}](vulnerabilities-info-${this.packageVersion}.md)`;
    }

    private get changelogRow() {
        return `- [${this.packageVersion}](changelog-${this.packageVersion}.md)`;
    }

    async beforeRun(inquirer: CommandInquirer) {
        const gitStatus = execSync(`git status --porcelain=v1`).toString().trimEnd();

        if (gitStatus.length > 0) {
            console.error(`The release script can be invoked only with clean repository state. Please either commit your changes or stash them.`);
            console.log(`You have the following git status:`);
            console.log(`----------------------------------`);
            console.log(gitStatus);
            console.log(`----------------------------------`);
            return 2;
        }

        this.inquirer = inquirer;
        return null;
    }

    async run() {
        await this.updateMonorepoPackageJson();
        await this.updateDeployableProjectVersion();

        if (this.updateAdf) {
            await this.askAdfTag();
            await this.askJsApiTag();

            console.log('Updating ADF version');
            await this.updateADFVersion();
        }

        console.log('Updating the third party license info for new version if not exist');
        await this.updateLicenseInfo();

        console.log('Updating the vulnerability info for new version if not exist');
        await this.updateVulnerabilityInfo();

        console.log('Updating the ADW and ACA compatibility matrix');
        await this.updateCompatibilityMatrix();

        if (!noChangelogReleaseTypes.has(this.releaseType)) {
            console.log('Generating changelog');
            await this.generateChangelog();
        }

        this.rebuildMonorepoBuilders();
        void this.askForCommit();
    }

    private async askAdfTag() {
        const adfTags = ['latest', 'next', 'alpha'];
        const answer = await this.inquirer.prompt([
            {
                type: 'list',
                name: 'adfTag',
                message: 'Which ADF tag you want to use',
                choices: adfTags,
            },
        ]);
        this.adfTag = answer.adfTag;
    }

    private async askJsApiTag() {
        const jsApiTags = ['latest', 'next', 'alpha'];
        const answer = await this.inquirer.prompt([
            {
                type: 'list',
                name: 'jsApiTag',
                message: `Which JS API tag you want to use`,
                choices: jsApiTags,
            },
        ]);
        this.jsApiTag = answer.jsApiTag;
    }

    private async updateDeployableProjectVersion() {
        const projects = await MonorepoController.getDeployableProjects();
        const questions = projects.map((project) => {
            const currentVersions = [project.suffixlessReleaseVersion, ...project.tagAliases];
            return {
                name: `${project.name}`,
                message: `New release version(s) of ${styleText('yellow', project.name)}${styleText(
                    ['gray', 'strikethrough'],
                    `@${currentVersions}`
                )}`,
                default: currentVersions.map((v) => incrementDBPVersion(v, this.releaseType)).join(','),
            };
        });

        const answers = await this.inquirer.prompt(questions);
        for (const project of projects) {
            const [newVersion, ...aliases] = answers[project.name].split(',');
            project.updateReleaseVersion(newVersion, aliases);
            ProjectMetadataIO.persistInfo(project);
        }
    }

    private async updateMonorepoPackageJson() {
        const currentPackageVersion = getWorkspacePackageJson().version;
        const question = {
            name: 'packageVersion',
            message: `The new version of monorepo package.json${styleText(['gray', 'strikethrough'], `@${currentPackageVersion}`)}`,
            default: incrementDBPVersion(currentPackageVersion, this.releaseType),
        };

        const answer = await this.inquirer.prompt<{ packageVersion: string }>(question);
        this.packageVersion = answer.packageVersion;
        execSync(`npm version --allow-same-version --no-git-tag-version --force ${this.packageVersion}`);
    }

    private async updateADFVersion() {
        execSync(`npm run dx adf/update-version -- -v ${this.adfTag} -j ${this.jsApiTag}`, { stdio: 'inherit' });
    }

    private async updateLicenseInfo() {
        const data = fs.readFileSync(this.licenseReadMePath, { encoding: 'utf8', flag: 'r' });
        if (data.includes(this.licenseRow)) {
            console.info(
                styleText('gray', `Third party license info has been already added for version: ${this.packageVersion}, nothing to do here.`)
            );
        } else {
            execSync('adf-cli licenses', { stdio: 'inherit' });
            fs.renameSync(
                `${process.cwd()}/license-info-${this.packageVersion}.md`,
                `${process.cwd()}/docs/license-info/license-info-${this.packageVersion}.md`
            );
            fs.appendFileSync(this.licenseReadMePath, `${this.licenseRow}\n`);
        }
    }

    private async updateVulnerabilityInfo() {
        const data = fs.readFileSync(this.vulnerabilityReadMePath, { encoding: 'utf8', flag: 'r' });
        if (data.includes(this.vulnerabilityRow)) {
            console.info(styleText('gray', `Vulnerability info has been already added for version: ${this.packageVersion}, nothing to do here.`));
        } else {
            execSync('adf-cli audit', { stdio: 'inherit' });
            fs.renameSync(
                `${process.cwd()}/audit-info-${this.packageVersion}.md`,
                `${process.cwd()}/docs/vulnerabilities-info/vulnerabilities-info-${this.packageVersion}.md`
            );
            fs.appendFileSync(this.vulnerabilityReadMePath, `${this.vulnerabilityRow}\n`);
        }
    }

    private async updateCompatibilityMatrix() {
        try {
            const matrix = new CompatibilityMatrix();
            await matrix.updateCompatibilityMatrix(process.cwd());
        } catch {
            console.error('Something went wrong in the compatibility matrix step. The file has not been aligned');
        }
    }

    private async generateChangelog() {
        const data = fs.readFileSync(this.changelogReadMePath, { encoding: 'utf8', flag: 'r' });
        if (data.includes(this.changelogRow)) {
            console.info(styleText('gray', `Changelog has been already added for version: ${this.packageVersion}, nothing to do here.`));
        } else {
            execSync(`adf-cli changelog -o ${process.cwd()}/docs/changelog`, { stdio: 'inherit' });
            fs.appendFileSync(this.changelogReadMePath, `${this.changelogRow}\n`);
        }
    }

    private rebuildMonorepoBuilders() {
        // With npm installing any new package version, the monorepo-builders package is wiped out from node_modules, because it is not in package.json
        execSync(`npm run build monorepo-core`);
        execSync(`npm run build monorepo-builders`);
    }

    private async askForCommit() {
        const { commit } = await this.inquirer.prompt([
            {
                type: 'confirm',
                name: `commit`,
                message: `Please check the modified files and type 'y' if the commit can be made on git history. Otherwise type 'n', apply your changes, and commit manually.`,
                default: true,
            },
        ]);

        const releaseCommitMessage = `[ci:release:${this.releaseType}] ${this.packageVersion}`;

        try {
            if (commit) {
                execSync(`git add .`, { stdio: 'inherit' });
                execSync(`echo "${releaseCommitMessage}" | git commit --allow-empty --file -`, { stdio: 'inherit' });
            } else {
                throw new Error('Release commit creation has been canceled by user.');
            }
        } catch (error) {
            console.warn(
                `Release process interrupted. After finishing your changes please make the commit with the following commit message:\n${styleText(
                    'green',
                    'git commit -m "' + releaseCommitMessage + '"'
                )}`
            );
            throw error;
        }
    }
}

function getWorkspacePackageJson() {
    const packagePath = join(process.cwd(), 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}
