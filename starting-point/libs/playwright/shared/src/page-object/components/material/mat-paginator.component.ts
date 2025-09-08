/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '.';

export class MatPaginatorComponent extends BaseComponent {
    private static rootElement = materialLocators.Paginator.class;

    constructor(page: Page) {
        super(page, MatPaginatorComponent.rootElement);
    }

    selectTriggerLocator = this.getChild(materialLocators.Paginator.dropdownTrigger);
    getPanelListNumber = (panelNumber: string) => this.page.getByRole('option', { name: panelNumber, exact: true });
    getPaginationRangeAction = (rangeAction: string) => this.getChild(materialLocators.Paginator.navigation(rangeAction));

    changePagination = async (itemsNumber: string) => {
        await this.selectTriggerLocator.click();
        await this.getPanelListNumber(itemsNumber).click();
    };

    async navigateToFirstPage(): Promise<void> {
        while (await this.getPaginationRangeAction('previous').isEnabled()) {
            await this.getPaginationRangeAction('previous').click();
        }
        await this.spinnerWaitForReload();
    }
}
