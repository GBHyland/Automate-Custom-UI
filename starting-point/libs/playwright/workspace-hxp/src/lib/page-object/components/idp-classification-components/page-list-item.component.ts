/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpPageListItemComponent extends BaseComponent {
    constructor(page: Page, index: number) {
        const rootElement = `[data-automation-id=idp-list-item-page__${index}]`;
        super(page, rootElement);
    }
}
