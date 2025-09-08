/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class SatoriHeaderComponent extends BaseComponent {
    static rootElement = 'sat-app-header';

    constructor(page: Page) {
        super(page, SatoriHeaderComponent.rootElement);
    }

    appHeaderTitle = this.getChild('.sat-app-header-title');
    appHeaderLogo = this.getChild('.sat-app-header-logo');
    appHeaderActionsButton = this.getChild('.sat-app-header-actions button');
}
