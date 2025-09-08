/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from 'playwright';
import { BaseMock } from '@alfresco-dbp/playwright/shared';

export class DocumentMock extends BaseMock {
    private uploadPattern = /.*\/api\/upload\?.*/;
    private documentPattern = '**/api/documents/*';

    constructor(page: Page) {
        super(page);
    }

    async disableUploadEndpoint(): Promise<void> {
        await this.disableEndpoint(this.uploadPattern);
    }

    async enableUploadEndpoint(): Promise<void> {
        await this.page.unroute(this.uploadPattern);
    }

    async disableDocumentsEndpoint(): Promise<void> {
        await this.disableEndpoint(this.documentPattern);
    }

    async enableDocumentsEndpoint(): Promise<void> {
        await this.page.unroute(this.documentPattern);
    }
}
