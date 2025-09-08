/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '../material';

export class OverlayPaneComponent extends BaseComponent {
    private static rootElement = '.cdk-overlay-pane';

    constructor(page: Page) {
        super(page, OverlayPaneComponent.rootElement);
    }

    deleteSelectedProjectsLocator = this.getElementByAutomationId('studio-project-list-header-select-all-menu-delete');
    getNameInputLocator = this.getElementByAutomationId('ama-form-fields-renderer-input-name');
    getDescriptionInputLocator = this.getElementByAutomationId('ama-form-fields-renderer-textarea-description');
    getCreateContentModelButtonLocator = this.getElementByAutomationId('create-content-model-submit-button');
    getDateRangeOption = (option: string) => this.getChild(materialLocators.Select.panel.class).filter({ hasText: option.toLowerCase() });
    getOverlayElementById = (id: string) => this.getChild(`#${id}`);
    getDialogConfirmButtonLocatorByOverlayElementId = (id: string) => this.getOverlayElementById(id).locator('[data-automation-id="dialog-confirm"]');
    getOverlayOptions = this.getChild('[role="option"]');
}
