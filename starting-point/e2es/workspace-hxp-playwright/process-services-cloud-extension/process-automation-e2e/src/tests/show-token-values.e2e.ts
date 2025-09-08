/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { expect, UtilRandom, getUserState, HXP_APPS, ProcessInstanceDataEntry, timeouts } from '@alfresco-dbp/playwright/shared';
import { test } from '@hxp/playwright/workspace-hxp';
import jwt from 'jsonwebtoken';

test.use({ storageState: getUserState('repoadmin') });

test.describe('Retrieve the sub and jti claims from bearer token', () => {
    const { subJtiTokensProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const processName = `e2e-sub-jti-tokens-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
    let processInstance: ProcessInstanceDataEntry;
    let generatedDocument: any;
    let token: any;

    test.beforeEach(async ({ processPage, runtimeBundleServiceRepoAdmin }, workerInfo) => {
        await processPage.refreshUserState('repoadmin', workerInfo.project.use);
        ({ entry: processInstance } = await runtimeBundleServiceRepoAdmin.processInstance.startProcess(subJtiTokensProcess.processDefinitionKey, {
            name: processName,
        }));
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser, contentBrowserPage }) => {
        await contentBrowserPage.documentViewer.deleteDocumentButtonLocator.click();
        await contentBrowserPage.matDialogContainer.getButtonByExactText('Delete Document').click();
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(processInstance.id);
    });

    test(`[XAT-17947] Should be able to extract 'sub' and 'jti' from token and validate their values`, async ({
        taskDetailsPage,
        contentBrowserPage,
        runtimeBundleServiceRepoAdmin,
    }) => {
        await test.step('Extended test timeout as the pdf file generation takes more time to complete', async () => {
            test.setTimeout(timeouts.extendedTest);
        });

        await test.step('Complete user task and intercept the auth token', async () => {
            const userTask = await runtimeBundleServiceRepoAdmin.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.id);

            taskDetailsPage.page.on('request', (request) => {
                const url = request.url();
                const headers = request.headers();

                if (url.includes('submit')) {
                    const authHeader = headers['authorization'];
                    token = authHeader.split(' ')[1];
                }
            });

            await taskDetailsPage.navigate({ query: `/${userTask[0].entry.id}`, waitUntil: 'load' });
            await taskDetailsPage.taskForm.getActionButtonLocator('Complete').click();
        });

        await test.step('Wait for the new pdf document to be generated', async () => {
            try {
                await expect
                    .poll(
                        async () => {
                            generatedDocument = await runtimeBundleServiceRepoAdmin.processInstance.getProcessVariable(
                                processInstance.id,
                                'generatedDoc'
                            );
                            return generatedDocument && generatedDocument.sys_id !== undefined ? generatedDocument.sys_id : null;
                        },
                        { timeout: 60000, intervals: [3000] }
                    )
                    .not.toBeNull();
            } catch {
                throw new Error('Document generation did not complete within 60 seconds or result is undefined.');
            }
        });

        await test.step('Get the document content and verify if the printed jti and sub claims are the same as in the auth token', async () => {
            await contentBrowserPage.navigateToDocument(generatedDocument.sys_id);
            await contentBrowserPage.documentViewer.documentContent.waitFor({ state: 'visible' });
            const documentContent = await contentBrowserPage.documentViewer.getDocumentContent();
            const decoded = jwt.decode(token);
            const sub = (decoded as any).sub;
            const jti = (decoded as any).jti;

            expect.soft(documentContent).toContain(`SUB: ${sub}`);
            expect(documentContent).toContain(`JTI: ${jti}`);
        });
    });
});
