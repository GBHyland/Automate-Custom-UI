/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DropdownAutocompleteComponent, PeopleOrGroupComponentDetails } from '../';
import { AbstractPeopleComponent } from './abstract-people.component';

export class RoleBasedIdentityPeopleComponent extends AbstractPeopleComponent {
    private static rootElement = 'identity-people';

    constructor(peopleComponentDetails: PeopleOrGroupComponentDetails) {
        super(
            peopleComponentDetails.page,
            RoleBasedIdentityPeopleComponent.getParentRootElement(peopleComponentDetails.parentRootElement, peopleComponentDetails.role)
        );
    }

    private static getParentRootElement(parentRootElement?: string, role?: string): string {
        let rootElement: string;

        if (parentRootElement && role) {
            rootElement = `${parentRootElement} [data-automation-id="apa-create-descriptor-identity-step-people-${role}"]`;
        }

        if (!parentRootElement && !role) {
            rootElement = RoleBasedIdentityPeopleComponent.rootElement;
        }

        if (parentRootElement && !role) {
            rootElement = `${parentRootElement} ${RoleBasedIdentityPeopleComponent.rootElement}`;
        }

        if (!parentRootElement && role) {
            rootElement = `[data-automation-id="apa-create-descriptor-identity-step-people-${role}"]`;
        }

        return rootElement;
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
