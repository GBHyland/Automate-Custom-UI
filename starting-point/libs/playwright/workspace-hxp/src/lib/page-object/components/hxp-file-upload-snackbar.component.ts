/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpFileUploadSnackbarComponent extends BaseComponent {
    static rootElement = '#upload-dialog';

    constructor(page: Page) {
        super(page, HxpFileUploadSnackbarComponent.rootElement);
    }

    fileNamesLocator = this.getChild('span.hxp-upload-snackbar-list-row__name');
    retryButtonLocator = this.getChild('').getByTestId('retry-upload');
    getUploadStatus = (status: string) => this.getChild(`hxp-upload-snackbar-list-row [title="${status}"]`);
}
