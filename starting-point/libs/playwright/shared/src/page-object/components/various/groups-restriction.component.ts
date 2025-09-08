/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { DropdownAutocompleteComponent, materialLocators } from '../';
import { AbstractGroupComponent } from './abstract-group.component';

export class GroupsRestrictionComponent extends AbstractGroupComponent {
    private static rootElement = 'ama-formeditor-groups-restriction-dialog';

    constructor(page: Page) {
        super(page, GroupsRestrictionComponent.rootElement);
    }

    dropdown = new DropdownAutocompleteComponent(this.page);

    getProgressBarGroupsLocator = this.getElementByAutomationId('identity-groups-progress-bar');
    groupsInputLocator = this.getChild('[data-automation-id="ama-identity-group-chip-list"] input');
    getGroupOptionLocator = this.getChild('[data-automation-id*="ama-identity-group-chip"][role="row"]');
    getTabLocatorByTitle = (tabTitle: string) => this.getChild(materialLocators.Tab.label, { hasText: tabTitle });

    async setGroup(groupName: string): Promise<void> {
        await super.setGroup(groupName);
        await this.dropdown.getOptionWithWait(groupName).click();
    }
}
