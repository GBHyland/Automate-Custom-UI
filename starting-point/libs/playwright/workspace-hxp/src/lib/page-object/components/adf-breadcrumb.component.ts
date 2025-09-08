/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class AdfBreadcrumbComponent extends BaseComponent {
    static rootElement = '.adf-breadcrumb';

    constructor(page: Page) {
        super(page, AdfBreadcrumbComponent.rootElement);
    }

    getBreadcrumbLink = (docName: string) => this.getChild('a', { hasText: docName });

    async getBreadcrumbArray(parentLocator = ''): Promise<string[]> {
        const selector = `${parentLocator} ${this.rootElementString} ol a`;
        const breadcrumbLocator = this.page.locator(selector.trim());

        await breadcrumbLocator.first().waitFor();
        const texts = await breadcrumbLocator.allTextContents();
        return texts.map((text) => text.trim());
    }

    async getLastDocumentName(): Promise<string> {
        const breadcrumbArray = await this.getBreadcrumbArray();
        return breadcrumbArray.at(-1) ?? '';
    }
}
