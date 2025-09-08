/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.describe('Form styling', () => {
    test.use({ storageState: getUserState('hruser') });

    const { formStylingProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const { header, displayText, radioButton } = formStylingProcess.form.formStyles;

    test.beforeEach(async ({ tasksPage }) => {
        await tasksPage.navigate();
    });

    test('[XAT-17157] Should be able to display form with defined styles for widgets', async ({ startProcessPage, tasksPage }) => {
        await test.step('Open the start process form', async () => {
            await tasksPage.pageLayoutHeaderComponent.startProcessButton.click();
            await tasksPage.startProcessDialog.selectProcess(formStylingProcess.processName);
        });

        await test.step('Verify form styling', async () => {
            const headerStyle = await startProcessPage.taskForm.getHeaderByIdLocator(header.widgetId).getAttribute('style');
            const displayTextStyle = await startProcessPage.taskForm.getFieldByIdLocator(displayText.widgetId).getAttribute('style');
            const radioButtonStyle = await startProcessPage.taskForm.getFieldByIdLocator(radioButton.widgetId).getAttribute('style');

            expect
                .soft(headerStyle)
                .toContain(
                    `--adf-header-color: ${header.fontColor}; ` +
                        `--adf-header-font-size: ${header.fontSize}; ` +
                        `--adf-header-font-weight: ${header.fontWeight};`
                );
            expect
                .soft(displayTextStyle)
                .toContain(
                    `--adf-readonly-text-color: ${displayText.fontColor}; ` +
                        `--adf-readonly-text-font-size: ${displayText.fontSize}; ` +
                        `--adf-readonly-text-font-weight: ${displayText.fontWeight};`
                );
            expect(radioButtonStyle).toContain(
                `--adf-radio-buttons-color: ${radioButton.fontColor}; ` +
                    `--adf-radio-buttons-font-size: ${radioButton.fontSize}; ` +
                    `--adf-radio-buttons-font-weight: ${radioButton.fontWeight};`
            );
        });
    });
});
