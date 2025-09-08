/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatDialogContainer, MenuComponent, BaseComponent } from './';
import { Page } from '@playwright/test';

export enum AmaModelTooltipButtons {
    Save = 'Save',
    Validate = 'Validate',
    EditorsMenu = 'Editors Menu',
    MoreMenu = 'More Menu',
}

export class AmaModelHeaderToolbar extends BaseComponent {
    private static rootElement = `.ama-model-header-toolbar`;

    matMenu = new MenuComponent(this.page);
    matDialog = new MatDialogContainer(this.page);

    constructor(page: Page) {
        super(page, AmaModelHeaderToolbar.rootElement);
    }

    getButtonByTitleLocator = (title: AmaModelTooltipButtons) => this.getChild(`button[title*='${title}']`);
    getEnabledButtonLocator = (title: AmaModelTooltipButtons) => this.getChild(`button[title*='${title}']:not([disabled='true'])`);
}
