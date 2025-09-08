/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { MenuComponent } from '../material';

export class AdfToolbarComponent extends BaseComponent {
    private static rootElement = 'adf-toolbar';

    constructor(page: Page, rootElement = AdfToolbarComponent.rootElement) {
        super(page, rootElement);
    }

    list = new MenuComponent(this.page);

    getMultiSelectCheckboxLocator = this.getElementByAutomationId('application-releases-multi-select-checkbox');
    getActionsMenuLocator = this.getChild('').getByRole('button').filter({ hasText: 'more_vert' });
}
