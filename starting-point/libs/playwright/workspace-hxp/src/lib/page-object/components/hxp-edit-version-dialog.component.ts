/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpEditVersionDialogComponent extends BaseComponent {
    static rootElement = 'hxp-version-edit-dialog';

    constructor(page: Page) {
        super(page, HxpEditVersionDialogComponent.rootElement);
    }
    versionTitleInputField = this.getChild('.hxp-input-area input');
    versionDescriptionInputField = this.getChild('.hxp-input-area textarea');
    saveButton = this.getChild('button .hxp-version-edit-dialog-save-btn-title');
}
