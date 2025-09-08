/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '.';

export class DialogActionsComponent extends BaseComponent {
    constructor(page: Page) {
        super(page, materialLocators.Dialog.actions);
    }

    getDialogCloseButton = this.getElementByAutomationId('dialog-close');
}
