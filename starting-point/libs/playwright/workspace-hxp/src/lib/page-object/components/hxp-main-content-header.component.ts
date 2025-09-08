/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { AdfBreadcrumbComponent } from './adf-breadcrumb.component';
import { HxpSearchInputComponent } from './hxp-search-input.component';

export class MainContentHeaderComponent extends BaseComponent {
    static rootElement = '.hxp-main-content-header';

    constructor(page: Page) {
        super(page, MainContentHeaderComponent.rootElement);
    }

    breadcrumb = new AdfBreadcrumbComponent(this.page);
    searchInput = new HxpSearchInputComponent(this.page);

    newFileUploadButton = this.getChild('.hxp-create-document-menu-button', { hasText: ' File Upload ' });
}
