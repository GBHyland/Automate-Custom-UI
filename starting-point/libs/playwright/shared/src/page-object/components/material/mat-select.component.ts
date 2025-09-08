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

export class MatSelectComponent extends BaseComponent {
    private optionLocator = materialLocators.Option.root;

    constructor(page: Page) {
        super(page, materialLocators.Select.panel.class);
    }

    getOptionByName = (text: string) => this.getChild(this.optionLocator).getByText(text, { exact: true });
}
