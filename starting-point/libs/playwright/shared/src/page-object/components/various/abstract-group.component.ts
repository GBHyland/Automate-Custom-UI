/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { timeouts } from '../../../utils/timeouts';

export abstract class AbstractGroupComponent extends BaseComponent {
    constructor(page: Page, rootElement: string) {
        super(page, rootElement);
    }

    abstract groupsInputLocator: Locator;
    abstract getGroupOptionLocator: Locator;

    getGroupByGroupNameLocator = (groupName: string) => this.getGroupOptionLocator.filter({ hasText: groupName });
    getRemoveButtonForGroupLocator = (groupName: string) => this.getGroupByGroupNameLocator(groupName).locator('[data-automation-id*="-remove-"]');

    async setGroup(groupName: string): Promise<void> {
        await this.groupsInputLocator.pressSequentially(groupName, { delay: timeouts.typingDelay });
    }
}
