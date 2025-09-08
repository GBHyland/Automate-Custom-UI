/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DropdownAutocompleteComponent, PeopleOrGroupComponentDetails } from '../';
import { AbstractGroupComponent } from './abstract-group.component';

export class RoleBasedIdentityGroupComponent extends AbstractGroupComponent {
    private static rootElement = 'identity-groups';

    constructor(peopleComponentDetails: PeopleOrGroupComponentDetails) {
        super(
            peopleComponentDetails.page,
            RoleBasedIdentityGroupComponent.getParentRootElement(peopleComponentDetails.parentRootElement, peopleComponentDetails.role)
        );
    }

    private static getParentRootElement(parentRootElement?: string, role?: string): string {
        let rootElement: string;

        if (parentRootElement && role) {
            rootElement = `${parentRootElement} [data-automation-id="apa-create-descriptor-identity-step-groups-${role}"]`;
        }

        if (!parentRootElement && !role) {
            rootElement = RoleBasedIdentityGroupComponent.rootElement;
        }

        if (parentRootElement && !role) {
            rootElement = `${parentRootElement} ${RoleBasedIdentityGroupComponent.rootElement}`;
        }

        if (!parentRootElement && role) {
            rootElement = `[data-automation-id="apa-create-descriptor-identity-step-people-${role}"]`;
        }

        return rootElement;
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
