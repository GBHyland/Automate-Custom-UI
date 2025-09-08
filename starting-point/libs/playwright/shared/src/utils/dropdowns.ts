/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { DropdownListComponent } from '../page-object/components/dropdowns/dropdown-list.component';

export async function getDropdownValues(page: Page, dropdownLocator: Locator): Promise<string[]> {
    const dropdownId = await dropdownLocator.getAttribute('id');
    const dropdownList = new DropdownListComponent(page, `#${dropdownId}-panel`);
    await dropdownLocator.click();

    return dropdownList.getOptionsList();
}
