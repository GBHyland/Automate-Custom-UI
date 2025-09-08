/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import {
    AdfInfoDrawer,
    ChangeAssigneeDialog,
    HxpAttachFileDialogComponent,
    HxpFilePreviewComponent,
    HxpFileUploadDialogComponent,
    TaskHeaderComponent,
    UserTaskFormComponent,
} from '../components';
import { HomePage } from './home.page';
import { MenuComponent } from '@alfresco-dbp/playwright/shared';

export type MenuActions = 'View' | 'Download' | 'Remove';
export class TaskDetailsPage extends HomePage {
    private static pageUrl = 'task-details-cloud';

    constructor(page: Page) {
        super(page, TaskDetailsPage.pageUrl);
    }

    taskForm = new UserTaskFormComponent(this.page);
    taskHeader = new TaskHeaderComponent(this.page);
    infoDrawer = new AdfInfoDrawer(this.page);
    changeAssigneeDialog = new ChangeAssigneeDialog(this.page);
    fileUploadDialog = new HxpFileUploadDialogComponent(this.page);
    attachFileDialog = new HxpAttachFileDialogComponent(this.page);
    menu = new MenuComponent(this.page);
    filePreview = new HxpFilePreviewComponent(this.page);

    getPageContentByPageNameLocator = (pageSelector: string) => this.page.locator(pageSelector);
    getEllipsisLocator = (fieldLabel: string, fileName: string) =>
        this.taskForm.getFieldByLabelLocator(fieldLabel).getByRole('row').filter({ hasText: fileName }).locator('button');

    async openAttachmentFormByName(labelName: string): Promise<void> {
        await this.taskForm.getFieldButtonLocator(labelName, 'Attach').click();
        await this.attachFileDialog.waitForRootElement();
    }

    async openAttachmentFormById(buttonLocator: string): Promise<void> {
        await this.taskForm.getChild(buttonLocator).click();
        await this.attachFileDialog.waitForRootElement();
    }

    async performActionOnAttachedFile(fieldLabel: string, fileName: string, action: MenuActions): Promise<void> {
        await this.getEllipsisLocator(fieldLabel, fileName).click();
        await this.menu.getMenuItemByText(action).click();
    }

    async downloadAttachedFile(fieldLabel: string, fileName: string): Promise<null | string> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.performActionOnAttachedFile(fieldLabel, fileName, 'Download'),
        ]);
        return download.path();
    }
}
