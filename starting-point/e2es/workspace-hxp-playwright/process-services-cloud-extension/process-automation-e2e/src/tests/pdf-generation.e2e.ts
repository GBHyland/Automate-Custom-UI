/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    expect,
    UtilRandom,
    getUserState,
    TestFlags,
    HXP_APPS,
    FeatureFlagsNames,
    ProcessInstanceDataEntry,
    timeouts,
} from '@alfresco-dbp/playwright/shared';
import { test } from '@hxp/playwright/workspace-hxp';
import { formValues } from '../resources/form-values';

test.use({ storageState: getUserState('repoadmin') });

test.describe('Generating document based on user task', () => {
    const { pdfGenerationProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const {
        textInputId,
        integerInputId,
        decimalInputId,
        multilinetextInputId,
        dateInputId,
        amountInputId,
        dropdownSingle,
        dropdownMultiple,
        radiobuttonsInputId,
        checkboxInputId,
    } = pdfGenerationProcess.form.formWidgets;
    const processName = `e2e-pdf-generation-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
    let processInstance: ProcessInstanceDataEntry;
    let generatedDocument: any;

    test.beforeAll(async ({ skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.StudioGenerateFormFile, 'new-functionality');
    });

    test.beforeEach(async ({ processPage, runtimeBundleServiceHrUser }, workerInfo) => {
        await processPage.refreshUserState('repoadmin', workerInfo.project.use);
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(pdfGenerationProcess.processDefinitionKey, {
            name: processName,
        }));
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser, contentBrowserPage }) => {
        await contentBrowserPage.documentViewer.deleteDocumentButtonLocator.click();
        await contentBrowserPage.matDialogContainer.getButtonByExactText('Delete Document').click();
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(processInstance.id);
    });

    test(`${TestFlags.UnderFF} [XAT-17745] Should generate pdf document based on form submitted in user task`, async ({
        runtimeBundleServiceHrUser,
        contentBrowserPage,
    }) => {
        const randomName = UtilRandom.generateAlpha(10);
        const formData = {
            [textInputId]: randomName,
            [integerInputId]: formValues.integer,
            [decimalInputId]: formValues.decimal,
            [multilinetextInputId]: formValues.multiline,
            [dateInputId]: `${formValues.date}T00:00:00.000Z`,
            [amountInputId]: formValues.amount,
            [dropdownSingle]: { id: 'Id_2', name: formValues.dropdownSingle },
            [dropdownMultiple]: [
                { id: 'Id_1', name: formValues.dropdownMultiple[0] },
                { id: 'Id_3', name: formValues.dropdownMultiple[1] },
            ],
            [radiobuttonsInputId]: { id: 'Id_2', name: formValues.radiobuttons },
            [checkboxInputId]: true,
        };

        await test.step('Extended test timeout as the pdf file generation takes more time to complete', async () => {
            test.setTimeout(timeouts.extendedTest);
        });

        await test.step('Submit form in user task and wait for document generation', async () => {
            const userTask = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.id);
            await runtimeBundleServiceHrUser.forms.submitForm(userTask[0].entry, formData);

            try {
                await expect
                    .poll(
                        async () => {
                            generatedDocument = await runtimeBundleServiceHrUser.processInstance.getProcessVariable(
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

        await test.step('Get the document content and verify if all the data is correctly displayed', async () => {
            await contentBrowserPage.navigateToDocument(generatedDocument.sys_id);
            await contentBrowserPage.documentViewer.documentContent.waitFor({ state: 'visible' });
            const documentContent = await contentBrowserPage.documentViewer.getDocumentContent();

            const formValuesAsStrings = Object.values(formValues).flat().map(String);
            const expectedStrings = [
                'Tab1',
                'Tab2',
                'Column1',
                'Group header test',
                'Checkbox',
                '2025-03-22',
                'Hyland website',
                'Text displayed inside section.',
                'This is an example of formatted text',
                'Text from a process variable',
                'This is a test text to be displayed.',
            ];
            const allExpectedStrings = [...formValuesAsStrings, ...expectedStrings];

            for (const expected of allExpectedStrings) {
                expect.soft(documentContent).toContain(expected);
            }
            expect(documentContent).not.toContain('This should be hidden');
        });
    });
});
