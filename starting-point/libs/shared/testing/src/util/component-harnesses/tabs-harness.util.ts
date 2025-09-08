/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTabGroupHarness, MatTabHarness, TabGroupHarnessFilters, TabHarnessFilters } from '@angular/material/tabs/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface TabGroupProps extends BaseHarnessProps {
    tabGroupFilters?: TabGroupHarnessFilters;
}

interface TabProps extends TabGroupProps {
    tabFilters?: TabHarnessFilters;
}

export class TabsHarnessUtils {
    private static loader: HarnessLoader;

    public static async getTabGroup({ fixture, tabGroupFilters, fromRoot = false }: TabGroupProps): Promise<MatTabGroupHarness> {
        TabsHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const tabGroup = await TabsHarnessUtils.loader.getHarness(MatTabGroupHarness.with(tabGroupFilters));

        return tabGroup;
    }

    public static async getTabs(tabProps: TabProps): Promise<MatTabHarness[]> {
        const tabGroup = await TabsHarnessUtils.getTabGroup(tabProps);

        return tabGroup.getTabs(tabProps.tabFilters);
    }
}
