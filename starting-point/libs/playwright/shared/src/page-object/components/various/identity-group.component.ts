/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { DropdownAutocompleteComponent } from '../';
import { AbstractGroupComponent } from './abstract-group.component';

export class IdentityGroupComponent extends AbstractGroupComponent {
    private static rootElement = 'identity-groups';

    constructor(page: Page, parentRootElement?: string) {
        super(page, parentRootElement ? `${parentRootElement} ${IdentityGroupComponent.rootElement}` : IdentityGroupComponent.rootElement);
    }

    dropdown = new DropdownAutocompleteComponent(this.page);

    getProgressBarGroupsLocator = this.getElementByAutomationId('identity-groups-progress-bar');
    groupsInputLocator = this.getChild('[data-automation-id="ama-identity-group-chip-list"] input');
    getGroupOptionLocator = this.getChild('[data-automation-id*="ama-identity-group-chip"][role="row"]');

    async setGroup(groupName: string): Promise<void> {
        await super.setGroup(groupName);
        await this.dropdown.getOptionWithWait(groupName).click();
    }
}
