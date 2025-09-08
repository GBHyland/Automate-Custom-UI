/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpDatepickerActionsContainerComponent extends BaseComponent {
    static readonly rootElement = '.hxp-datepicker-actions-container';

    constructor(page: Page) {
        super(page, HxpDatepickerActionsContainerComponent.rootElement);
    }

    okButton = this.getChild('.hxp-datepicker-right-actions button', { hasText: ' OK ' });
}
