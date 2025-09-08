/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpWorkspaceHeaderComponent extends BaseComponent {
    private static rootElement = 'hxp-workspace-header';

    constructor(page: Page, rootElement = HxpWorkspaceHeaderComponent.rootElement) {
        super(page, rootElement);
    }

    getLogoLocator = this.getChild('.hxp-header-logo img');
    getAppTitleLocator = this.getChild('adf-layout-header h1');
    getAppHeaderContainerLocator = this.getChild('hxp-header');
    getLegacyAppHeaderContainerLocator = this.getChild('.adf-toolbar-container-row');
}
