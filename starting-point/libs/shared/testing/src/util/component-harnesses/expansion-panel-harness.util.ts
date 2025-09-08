/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatExpansionPanelHarness, ExpansionPanelHarnessFilters } from '@angular/material/expansion/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface ExpansionPanelProps extends BaseHarnessProps {
    expansionPanelFilters?: ExpansionPanelHarnessFilters;
}

export class ExpansionPanelHarnessUtils {
    private static loader: HarnessLoader;

    public static async getAllExpansionPanels({
        fixture,
        expansionPanelFilters,
        fromRoot = false,
    }: ExpansionPanelProps): Promise<MatExpansionPanelHarness[]> {
        ExpansionPanelHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const allExpansionPanels = await ExpansionPanelHarnessUtils.loader.getAllHarnesses(MatExpansionPanelHarness.with(expansionPanelFilters));

        return allExpansionPanels;
    }

    public static async getExpansionPanel({
        fixture,
        expansionPanelFilters,
        fromRoot = false,
    }: ExpansionPanelProps): Promise<MatExpansionPanelHarness> {
        ExpansionPanelHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const expansionPanel = await ExpansionPanelHarnessUtils.loader.getHarness(MatExpansionPanelHarness.with(expansionPanelFilters));

        return expansionPanel;
    }

    public static async toggleExpansionPanel({ fixture, expansionPanelFilters, fromRoot = false }: ExpansionPanelProps): Promise<void> {
        ExpansionPanelHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const expansionPanel = await ExpansionPanelHarnessUtils.loader.getHarness(MatExpansionPanelHarness.with(expansionPanelFilters));

        return expansionPanel.toggle();
    }
}
