/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpClassificationHeaderComponent extends BaseComponent {
    static rootElement = '.idp-task-header';

    constructor(page: Page) {
        super(page, HxpIdpClassificationHeaderComponent.rootElement);
    }
    documentClassesCount = this.getElementByAutomationId('header-idp_class_verification.task_header.document_classes');
    documentCount = this.getElementByAutomationId('header-idp_class_verification.task_header.total_documents');
    pagesCount = this.getElementByAutomationId('header-idp_class_verification.task_header.total_pages');
    goBackButton = this.getElementByAutomationId('idp-go-back-button');
    importDocumentsButton = this.getElementByAutomationId('idp-document-upload__button');
}
