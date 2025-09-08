/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpDocumentMoreMenuPanelComponent extends BaseComponent {
    static rootElement = `[data-automation-id="hxp-document-more-menu-panel"]`;

    constructor(page: Page) {
        super(page, HxpDocumentMoreMenuPanelComponent.rootElement);
    }
}
