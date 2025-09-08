/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpShortcutDialogComponent extends BaseComponent {
    static rootElement = '.idp-shortcut-browser-dialog';

    constructor(page: Page) {
        super(page, HxpIdpShortcutDialogComponent.rootElement);
    }

    shortcutDialogTitle = this.getElementByAutomationId('idp-shortcut-dialog-title');
    shortcutDialogInput = this.getElementByAutomationId('idp-shortcut-search-input');
    shortcutDialogClearButton = this.getElementByAutomationId('idp-shortcut-search-clear');
    shortcutDialogCloseButton = this.getElementByAutomationId('idp-shortcut-dialog-close');

    navigateUpShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-navigate-up');
    selectAllPagesShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-select-all-pages-or-documents');
    undoLastActionShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-undo-last-action');
    redoLastActionShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-redo-last-action');
    saveShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-save');
    submitShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-submit');
}
