/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';

export class RadioButtonComponent extends BaseComponent {
    private static rootElement = 'radio-buttons-cloud-widget';
    constructor(page: Page) {
        super(page, RadioButtonComponent.rootElement);
    }

    getRadioButtonComponentById = (id: string) => this.getChild(`#${id}`);
    getRadioButtonOptionsById = (id: string) => this.getRadioButtonComponentById(id).locator('input');
}
