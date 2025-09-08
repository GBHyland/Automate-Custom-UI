/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpFileUploadDialogComponent extends BaseComponent {
    static rootElement = 'hxp-file-uploading-dialog';

    constructor(page: Page) {
        super(page, HxpFileUploadDialogComponent.rootElement);
    }

    dialogTitleLocator = this.getChild('.adf-upload-dialog__title');
}
