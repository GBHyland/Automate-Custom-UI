/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { AdfToolbarComponent, BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpFilePreviewComponent extends BaseComponent {
    private static rootElement = 'adf-viewer';

    toolbar = new AdfToolbarComponent(this.page);

    constructor(page: Page, rootElement = HxpFilePreviewComponent.rootElement) {
        super(page, rootElement);
    }

    getFileNameLocator = this.toolbar.getChild('#adf-viewer-title-display-name .adf-viewer__display-name-value');
    getCloseButtonLocator = this.toolbar.getElementByAutomationId('adf-toolbar-left-back');
}
