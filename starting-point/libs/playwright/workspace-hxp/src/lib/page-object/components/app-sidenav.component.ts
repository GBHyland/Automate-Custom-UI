/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { SideNavbarComponent } from '@alfresco-dbp/playwright/shared';

export const ContentExpandableMenuLabels = {
    ProcessManagement: 'Process Management',
    ContentManagement: 'Content Management',
} as const;
export type ContentExpandableMenuLabels = typeof ContentExpandableMenuLabels[keyof typeof ContentExpandableMenuLabels];

export const ProcessManagementLabels = {
    MyTasks: 'my-tasks_filter',
    QueuedTasks: 'queued-tasks_filter',
    CompletedTasks: 'completed-tasks_filter',
    RunningProcesses: 'running-processes_filter',
    CompletedProcesses: 'completed-processes_filter',
    AllProcesses: 'all-processes_filter',
} as const;
export type ProcessManagementLabels = typeof ProcessManagementLabels[keyof typeof ProcessManagementLabels];

export const ContentBrowserLabels = {
    HomeLabel: ' Home ',
} as const;
export type ContentBrowserLabels = typeof ContentBrowserLabels[keyof typeof ContentBrowserLabels];

export class AppSideNavComponent extends SideNavbarComponent {
    static rootElement = '.adf-layout-container-sidenav';
    private leftMenuItemPanel = '.hxp-node-container';
    private sideNavPanelTitle = '.hxp-panel-title';

    constructor(page: Page) {
        super(page, AppSideNavComponent.rootElement);
    }

    getSidenavItemLabelLocator = (label: ProcessManagementLabels) =>
        this.getElementByAutomationId(label).locator('[data-automation-id="adf-filter-label"]');
    searchButtonLocator = this.getChild('button.hxp-search-menu-item_button');
    governanceButtonLocator = this.getChild('hxp-governance-sidenav-menu-item button');
    getMyTaskCounterLocator = this.getElementByAutomationId('my-tasks_filter-counter');
    getQueuedTaskCounterLocator = this.getElementByAutomationId('queued-tasks_filter-counter');
    getRunningProcessesCounterLocator = this.getElementByAutomationId('running-processes_filter-counter');
    getQueuedTasksCounterActive = this.getChild(`[data-automation-id='queued-tasks_filter-counter'][class*='adf-active']`);

    /**
     *
     * original navigateTo retrieve locator via automation-id
     * hxpContentBrowserNavigateTo retrieve locator from children of element with class hxp-node-container
     * with a particular text, because the document tree is generated dynamically and there is no automation-id.
     *
     */
    override async navigateTo(buttonName: string, parentExpandablePanelName?: string): Promise<void> {
        const processExpandableButtons = Object.values<string>(ProcessManagementLabels);
        if (processExpandableButtons.includes(buttonName)) {
            return super.navigateTo(buttonName, parentExpandablePanelName);
        }
        const contentExpandableButtons = Object.values<string>(ContentBrowserLabels);
        if (contentExpandableButtons.includes(buttonName)) {
            return this.contentBrowserNavigateTo(buttonName, parentExpandablePanelName);
        }
    }

    async contentBrowserNavigateTo(
        menuItem: string,
        parentExpandablePanelName: string = ContentExpandableMenuLabels.ContentManagement
    ): Promise<void> {
        if (parentExpandablePanelName) {
            await this.expandPanelHeader(parentExpandablePanelName);
        }
        await this.getContentMenuItemByNameLocator(menuItem).dblclick();
        await this.spinnerWaitForReload();
    }

    getSideNavbarTitle = (titleName: string) => this.getChild(this.sideNavPanelTitle, { hasText: titleName });

    getContentMenuItemByNameLocator = (headerName: string) => this.getChild(this.leftMenuItemPanel, { hasText: headerName });

    getRowByName = (name: string) => this.getChild(`hxp-workspace-document-tree .hxp-node-container`, { hasText: name.toString() });

    getDocumentInContentTreeByName = (documentToFind: string) => this.getChild(`[role = "treeitem"]`, { hasText: documentToFind.toString() });

    ellipsisLocator = (documentTitle: string) =>
        this.getDocumentInContentTreeByName(documentTitle).getByRole('button').filter({ hasText: 'more_vert' });
    expandButtonLocator = (documentTitle: string) =>
        this.getDocumentInContentTreeByName(documentTitle).getByRole('button').filter({ hasText: 'chevron_right' });
}
