/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { DropdownAutocompleteComponent } from '../';
import { AbstractPeopleComponent } from './abstract-people.component';

export class IdentityPeopleComponent extends AbstractPeopleComponent {
    private static rootElement = 'identity-people';

    constructor(page: Page, parentRootElement?: string) {
        super(page, parentRootElement ? `${parentRootElement} ${IdentityPeopleComponent.rootElement}` : IdentityPeopleComponent.rootElement);
    }

    dropdown = new DropdownAutocompleteComponent(this.page);

    getProgressBarPeopleLocator = this.getElementByAutomationId('identity-people-progress-bar');
    getUsersInputLocator = this.getChild('[data-automation-id="ama-identity-people-chip-list"] input');
    getUserOptionLocator = this.getChild('[data-automation-id*="ama-identity-people-chip"]').getByRole('row');

    async setUser(user: string): Promise<void> {
        await this.getProgressBarPeopleLocator.waitFor({ state: 'hidden' });
        await super.setUser(user);
        await this.dropdown.firstOptionLocator.click();
    }
}
