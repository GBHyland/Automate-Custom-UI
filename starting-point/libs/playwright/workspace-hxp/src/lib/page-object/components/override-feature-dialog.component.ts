/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';

export class OverrideFeatureDialogComponent extends BaseComponent {
    static rootElement = '.override-features-dialog';

    constructor(page: Page) {
        super(page, OverrideFeatureDialogComponent.rootElement);
    }

    panelDialogTitle = this.getChild('.feature-flags-overrides-header-text span', { hasText: 'Feature flag overrides' });

    allFeatureSlideButton = this.getChild(`.feature-flags-overrides-header ${materialLocators.Slide.toggle}`);

    closeButton = this.getChild('.feature-flags-overrides-header-close');
    filterTextbox = this.getChild(materialLocators.Input.class);
    filterAddButton = this.getChild(materialLocators.Tooltip.trigger);
    featureFlagSlideButton = this.getChild(materialLocators.Accent.class);
    featureIcon = this.getChild('.fictive-flag-button');
    trashButton = this.getChild('.trash-icon');

    getFeatureByName = (text: string) => this.getChild(materialLocators.Table.row.class, { hasText: text });

    getSlideButtonByFeatureName = (text: string) =>
        this.getChild(materialLocators.Table.row.class, { hasText: text }).locator(materialLocators.Slide.toggle);

    getIconByFeatureName = (text: string) => this.getChild(materialLocators.Table.row.class, { hasText: text }).locator('.fictive-flag-button');

    getTrashByFeatureName = (text: string) => this.getChild(materialLocators.Table.row.class, { hasText: text }).locator('.trash-icon');

    removeFeature = async (feature: string): Promise<void> => {
        await this.getIconByFeatureName(feature).hover();
        await this.getTrashByFeatureName(feature).click();
        await this.closeButton.click();
    };

    addAndEnableFeature = async (feature: string): Promise<void> => {
        await this.allFeatureSlideButton.click();
        await this.filterTextbox.pressSequentially(feature);
        await this.filterAddButton.click();
        await this.getSlideButtonByFeatureName(feature).click();
        await this.closeButton.click();
    };
}
