/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, TestFlags, getUserState } from '@alfresco-dbp/playwright/shared';
import { expect, ProcessManagementLabels, test } from '@hxp/playwright/workspace-hxp';

/* eslint-disable @cspell/spellchecker */
export const Languages = {
    English: 'en',
    Français: 'fr',
    Deutsch: 'de',
    Italiano: 'it',
    Español: 'es',
    Polish: 'pl',
    Português: 'pt',
} as const;

export const MyTasksLabel = {
    English: ' My Tasks ',
    Français: ' Mes tâches ',
    Deutsch: ' Meine Aufgaben ',
    Italiano: ' I miei compiti ',
    Español: ' Mis tareas ',
    Polish: ' Moje zadania ',
    Português: ' As Minhas Tarefas ',
} as const;

test.use({ storageState: getUserState('hruser') });

test.describe('Automate Tests - Change language', () => {
    test(`${TestFlags.UnderFF} [XAT-17356] User should be able to change language of the app`, async ({
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.StudioEnableLocalisation, 'new-functionality');
        await contentBrowserPage.switchLanguageTo(Languages.Français);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Français);

        await contentBrowserPage.switchLanguageTo(Languages.Deutsch);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Deutsch);

        await contentBrowserPage.switchLanguageTo(Languages.Español);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Español);

        await contentBrowserPage.switchLanguageTo(Languages.Italiano);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Italiano);

        await contentBrowserPage.switchLanguageTo(Languages.Polish);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Polish);

        await contentBrowserPage.switchLanguageTo(Languages.Português);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Português);

        await contentBrowserPage.switchLanguageTo(Languages.English);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.English);
    });

    test(`${TestFlags.UnderFF} [XAT-17356-OLD] User should be able to change language of the app`, async ({
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.StudioEnableLocalisation, 'new-functionality');
        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.Français);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Français);

        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.Deutsch);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Deutsch);

        await contentBrowserPage.switchLanguageTo(Languages.Español);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Español);

        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.Italiano);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Italiano);

        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.Polish);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Polish);

        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.Português);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.Português);

        await contentBrowserPage.headerComponent.switchLanguageTo(Languages.English);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toContainText(MyTasksLabel.English);
    });
});
