/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    BasePage,
    MatDialogContainer,
    MenuComponent,
    MatSelectComponent,
    AdfLayoutHeaderComponent,
    HxpFiltersContainerComponent,
} from '@alfresco-dbp/playwright/shared';
import { AppSideNavComponent, HxpWorkspaceHeaderComponent, OverrideFeatureDialogComponent } from '../components';
import { SatPlatformNavPanelComponent } from '@hxp/playwright/shared-hxp';

export abstract class HomePage extends BasePage {
    contentSideNavbar = new AppSideNavComponent(this.page);
    matMenuComponent = new MenuComponent(this.page);
    matDialogContainer = new MatDialogContainer(this.page);
    headerComponent = new AdfLayoutHeaderComponent(this.page);
    featureFlagComponent = new OverrideFeatureDialogComponent(this.page);
    matSelectPanel = new MatSelectComponent(this.page);
    filterContainer = new HxpFiltersContainerComponent(this.page);
    hxpWorkspaceHeaderComponent = new HxpWorkspaceHeaderComponent(this.page);
    satPlatformNavPanelComponent = new SatPlatformNavPanelComponent(this.page);

    /**
     * @deprecated This method shouldn't be used across the tests. It's only for the purpose of testing the feature flag panel in development mode.
     * It is also used in Workspace because of an issue, that FF were never worked properly on localhost or CI. https://hyland.atlassian.net/browse/HXCS-3105
     * It will be removed in the future.
     * @param flagName
     * @returns
     */
    async enableFeatureFlag(flagName: string): Promise<boolean> {
        try {
            await this.page.evaluate(`document.featureOverrides.enable()`);
            await this.page.evaluate(`document.featureOverrides.resetFlags({ '${flagName}': true })`);
            return this.page.evaluate(`document.featureOverrides.isOn('${flagName}')`);
        } catch (error) {
            console.error('Failed to enable feature flag:', error);
            return false;
        }
    }
}
