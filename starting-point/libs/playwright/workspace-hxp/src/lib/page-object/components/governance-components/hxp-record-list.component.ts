/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpRecordListComponent extends BaseComponent {
    static readonly rootElement = '.hxp-record-list';

    constructor(page: Page) {
        super(page, HxpRecordListComponent.rootElement);
    }

    getRowByName = (name: string | number): Locator => this.getChild(`.hxp-record-list-row`, { hasText: name.toString() });
    getStatusCellByRow = (name: string | number): Locator => this.getRowByName(name).locator('.hxp-governance-record-status');
    getCategoryCellByRow = (name: string | number): Locator => this.getRowByName(name).locator('.cdk-column-categoryId');
    getCheckboxByRow = (name: string | number): Locator => this.getRowByName(name).locator('.cdk-column-select');
}
