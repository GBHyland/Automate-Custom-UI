/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';

export class HxpDocumentListPaginatorComponent extends BaseComponent {
    static rootElement = '.hxp-document-list-paginator';

    constructor(page: Page) {
        super(page, HxpDocumentListPaginatorComponent.rootElement);
    }

    selectTriggerLocator = this.getChild(materialLocators.Paginator.dropdownTrigger);
    getItemsPerPage = (itemsPage: string) => this.getChild(materialLocators.Select.value.class, { hasText: itemsPage });
    getPanelListNumber = (panelNumber: string) => this.page.getByRole('option', { name: panelNumber, exact: true });
    getPaginationRangeAction = (rangeAction: string) => this.getChild(materialLocators.Paginator.navigation(rangeAction));
}
