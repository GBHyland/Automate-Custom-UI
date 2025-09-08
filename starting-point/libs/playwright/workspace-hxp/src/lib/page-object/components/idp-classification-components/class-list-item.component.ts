/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { HxpIdpDocumentListItemComponent } from './document-list-item.component';

export class HxpIdpClassListItemComponent extends BaseComponent {
    constructor(page: Page, index: number) {
        const rootElement = `[data-automation-id=idp-list-item-class__${index}]`;
        super(page, rootElement);
    }

    getDocument(documentIndex: number) {
        return new HxpIdpDocumentListItemComponent(this.page, documentIndex);
    }

    className = this.getElementByAutomationId('idp-class-name');
}
