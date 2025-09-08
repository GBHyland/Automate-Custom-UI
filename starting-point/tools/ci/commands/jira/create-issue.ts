/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Command, Runnable, InputParam, ListParam } from '../../../shared/command';
import { Version2Client } from 'jira.js';
import { join } from 'node:path';
import fs from 'node:fs';

const PRODUCT_MAPPING = {
    automate: 'Automate',
    governance: 'Governance',
    hxviewer: 'Content',
    idp: 'IDP',
    workspace: 'Content',
};

@Command({
    name: 'create-issue',
    description: `This script create a Jira Issue from the failed e2e`,
})
export default class CreateIssue implements Runnable {
    @ListParam({
        required: true,
        alias: 'a',
        title: `Angular e2e project's name.`,
        choices: [],
        pageSize: 30,
    })
    application: string;

    @InputParam({ required: true, alias: 'u', title: 'jira account' })
    jiraUsername: string;

    @InputParam({ required: true, alias: 'p', title: 'jira password' })
    jiraPassword: string;

    @InputParam({ required: true, alias: 'o', title: 'jira host' })
    jiraHost: string;

    @InputParam({ required: true, alias: 'b', title: 'build log url' })
    buildLogUrl: string;

    @InputParam({ required: true, alias: 'j', title: 'Travis job name' })
    jobName: string;

    @InputParam({ required: true, alias: 'r', title: 'branch name' })
    branchName: string;

    @InputParam({ required: true, alias: 'x', title: 'URL' })
    url: string;

    @InputParam({ required: true, alias: 'w', title: 'jira project alias' })
    jiraProjectAlias: 'ACS' | 'AAE' | 'ACTIVITI';

    private jiraClient: Version2Client;

    async run() {
        this.jiraClient = new Version2Client({
            host: this.jiraHost,
            authentication: {
                basic: {
                    username: this.jiraUsername,
                    password: this.jiraPassword,
                },
            },
        });

        const playwrightTestsList = getJsonResultFromPlaywrightE2e();

        if (playwrightTestsList?.length > 0) {
            for (const result of playwrightTestsList) {
                await this.playwrightSave(result);
            }
        } else {
            console.info('No failing tests found');
        }
    }

    async playwrightSave(result: any) {
        console.log(`Creating Jira issue for Playwright test: ${result.suiteTitle} - ${result.testTitle}`);
        await this.createIssue(result.suiteTitle, result.testTitle, result.projectName, result.error);
    }

    private async checkIfBugExist(summaryBug: string): Promise<any> {
        // eslint-disable-next-line max-len
        const searchEpic = await this.jiraClient.issueSearch.searchForIssuesUsingJql({
            jql: `summary ~ "\\"${summaryBug}\\"" and type in (bug) AND project in (${this.jiraProjectAlias})`,
        });

        if (searchEpic.total === 1) {
            console.log(`⚠️ ${summaryBug} bug ALREADY EXIST using current summary`);
            return searchEpic.issues[0];
        } else if (searchEpic.total > 1) {
            console.error(`⛔️ ERROR more then 1 result found for existing Bug ${summaryBug} resolve this problem before to run it again`);
            return searchEpic.issues[0];
        }

        return null;
    }

    private async createIssue(
        suiteName: string,
        testName: string,
        projectName: string,
        testDescription?: { message: string; stack: string }
    ): Promise<void> {
        try {
            const summary = `[E2E] (${this.jobName}) ${suiteName} ${testName}`;

            console.info(`⚠️ Summary ${summary}`);

            const ticketExist = await this.checkIfBugExist(summary);

            const commentBody = `E2E failing on ${new Date().toUTCString()} at ${this.buildLogUrl}
                *Branch affected*: ${this.branchName}

                {code:title=Stack|borderStyle=solid}
                ${testDescription.stack}
                {code}
                *report url*: ${this.url}`;

            if (!ticketExist) {
                console.info(`⚠️ No jira issue found. Creating a new one.`);
                const description = `In the Job (${this.jobName}) the ${suiteName} it's failing

                *Failing test*: ${testName}


                {code:title=Stack|borderStyle=solid}
                ${testDescription.stack}
                {code}

                *report url*: ${this.url}`;

                const newTicket = await this.createJiraIssue(summary, description, projectName);

                await this.jiraClient.issueComments.addComment({
                    issueIdOrKey: newTicket.key,
                    body: commentBody,
                });
            } else {
                console.info(`⚠️ ${ticketExist.key} still failing `);

                await this.jiraClient.issueComments.addComment({
                    issueIdOrKey: ticketExist.key,
                    body: commentBody,
                });

                const currentLabels = ticketExist.fields.labels;
                const productLabel = this.getProductLabel(projectName);

                if (!currentLabels.includes(productLabel)) {
                    await this.jiraClient.issues.editIssue({
                        issueIdOrKey: ticketExist.key,
                        fields: {
                            labels: [...currentLabels, productLabel],
                        },
                    });
                }

                if (ticketExist.fields.status.name === 'Done') {
                    await this.openTask(ticketExist);
                }
            }
        } catch (error) {
            console.error(`⛔️ ERROR creating / reopening issue ${error}`);
            console.error(`⛔️ ERROR details: ${JSON.stringify(error?.response?.data?.errors)}`);
        }
    }

    async createJiraIssue(summary: string, description: string, projectName: string) {
        console.info(`⚠️ Creating new JIRA issue for ${summary} under project ${this.jiraProjectAlias}`);

        return this.jiraClient.issues.createIssue({
            fields: {
                labels: this.createLabels(projectName),
                components: [{ name: 'e2e' }],
                project: {
                    key: this.jiraProjectAlias,
                },
                summary: summary,
                description: description,
                // eslint-disable-next-line @cspell/spellchecker
                issuetype: {
                    id: 10004,
                },
                // eslint-disable-next-line @cspell/spellchecker
                customfield_13657: {
                    value: 'Category 2',
                },
                versions: [
                    {
                        name: 'none',
                    },
                ],
            },
        });
    }

    async openTask(issue) {
        console.info(`⚠️ [${issue.key}] Reopen`);

        await this.jiraClient.issues.doTransition({
            issueIdOrKey: issue.key,
            transition: {
                id: '11',
                to: {
                    id: '2',
                },
            },
        });
    }

    private getProductLabel(projectName?: string): string {
        if (!projectName) {
            return 'Automate';
        }
        if (projectName) {
            for (const [keyword, label] of Object.entries(PRODUCT_MAPPING)) {
                if (projectName.toLowerCase().includes(keyword.toLowerCase())) {
                    return label;
                }
            }
        }
        return 'Automate';
    }

    private createLabels(projectName?: string): string[] {
        const baseLabels = ['flaky-test', 'Frontend'];
        const productLabel = this.getProductLabel(projectName);

        return [...baseLabels, productLabel];
    }
}

function getJsonResultFromPlaywrightE2e(): Array<{ suiteTitle: string; testTitle: string; error: { message: string; stack: string } }> {
    const path = join(process.cwd(), `./e2e-output/playwright-data/testResults.json`);
    console.debug(`Looking for file: ${path}`);
    if (fs.existsSync(path)) {
        const content = JSON.parse(fs.readFileSync(path).toString());
        console.debug(`List for creating issues found! ${content}`);
        return content;
    }
    return [];
}
