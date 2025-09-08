/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DropdownListComponent, MatDialogContainer } from '@alfresco-dbp/playwright/shared';

export class HxpPermissionsManagementDialogContainer extends BaseComponent {
    static readonly rootElement = '.hxp-permissions-management-dialog-container';
    dropdownList = new DropdownListComponent(this.page, '.cdk-overlay-container');
    matDialogContainer = new MatDialogContainer(this.page);

    constructor(page: Page) {
        super(page, HxpPermissionsManagementDialogContainer.rootElement);
    }

    savePermissionFormButton = this.getChild('.hxp-save-permission-button');
    permissionColumnLocator = this.page.locator('.hxp-permission-select #hxp-user-permission');
    inheritedPermissionColumnLocator = this.getChild('.hxp-inherited-permission');
    individualUserPermissionStatusLabelLocator = this.getChild('.hxp-entity-details .hxp-users-icon');
    restorePermissionsButton = this.getChild('.hxp-restore-button');
    cancelPermissionButton = this.getChild('.hxp-cancel-button');
    // Entity refers to both User Groups and Individual Users
    addEntityButton = this.getChild('#hxp-add-permission-button');
    addEntityTextInputLocator = this.getChild('#hxp-add-permissions-text-search');
    addPermissionDropdown = this.page.locator('#hxp-permission-select');
    getPermissionTableContentLocator = this.getChild('.hxp-permission-dialog-list');

    getPermissionInheritanceToggle = (state: 'On' | 'Off') => this.getChild('.hxp-inheritance-toggle-container button').filter({ hasText: state });
    getPermissionTableEntityCell = (entityName: string) =>
        this.getPermissionTableContentLocator.locator('.hxp-entity-details', { hasText: entityName });
    inheritedIndividualUsersPermission = (user: string) => this.getChild('.hxp-permission-row').filter({ hasText: user });
    selectEditablePermission = (text: string) => this.page.locator('#hxp-user-permission-panel').locator('span', { hasText: text }).first();
    getRestorePermissionsOptionsLocator = (text: string) => this.matDialogContainer.getRadioButtonByNameLocator(text);
    getDialogBoxRestoreButton = this.matDialogContainer.getButtonByExactText('Restore');

    async addPermissionToEntity(entity: string, permission: string): Promise<void> {
        await this.addEntityTextInputLocator.fill(entity);
        await this.dropdownList.getOptionLocator(entity).click();
        await this.addPermissionDropdown.click();
        await this.dropdownList.getOptionLocator(permission).first().click();
        await this.addEntityButton.click();
        await this.savePermissionFormButton.click();
    }

    async editPermissionToEntity(permission: string): Promise<void> {
        await this.permissionColumnLocator.click();
        await this.selectEditablePermission(permission).click();
        await this.savePermissionFormButton.click();
    }

    async switchToTab(tabName: 'User Groups' | 'Individual Users'): Promise<void> {
        await this.getChild('').getByRole('tab').getByText(tabName).click();
        await this.spinnerWaitForReload('[role="tabpanel"].ng-animating');
    }
}
