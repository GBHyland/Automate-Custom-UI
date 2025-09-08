/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { ProcessManagementPage } from './';

export class ProcessDetailsPage extends ProcessManagementPage {
    private static pageUrl = 'process-details-cloud?processInstanceId=';

    constructor(page: Page) {
        super(page, ProcessDetailsPage.pageUrl);
    }

    async openProcessTaskByName(processInstance: ProcessInstanceDataEntry, taskName: string) {
        await this.navigate({ query: processInstance.id });
        await this.dataTable.waitForRootElement();
        await this.dataTable.getRowByName(taskName).first().click();
    }

    async getProcessInstanceIdFromCurrentUrl(processInstanceName: string): Promise<string | undefined> {
        await this.pageLayoutHeaderComponent.getChild(`[title="${processInstanceName}"]`).waitFor();
        const pageUrl = this.page.url();
        const uuidRegEx = /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/g;
        return pageUrl.match(uuidRegEx)?.toString();
    }
}
