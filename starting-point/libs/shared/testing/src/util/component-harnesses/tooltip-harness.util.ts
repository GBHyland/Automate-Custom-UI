/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTooltipHarness, TooltipHarnessFilters } from '@angular/material/tooltip/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface TooltipProps extends BaseHarnessProps {
    tooltipFilters?: TooltipHarnessFilters;
}

export class TooltipHarnessUtils {
    private static loader: HarnessLoader;

    static async getTooltip({ fixture, tooltipFilters, fromRoot = false }: TooltipProps): Promise<MatTooltipHarness> {
        TooltipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const tooltip = await TooltipHarnessUtils.loader.getHarness(MatTooltipHarness.with(tooltipFilters));

        return tooltip;
    }

    static async getAllTooltips({ fixture, tooltipFilters, fromRoot = false }: TooltipProps): Promise<MatTooltipHarness[]> {
        TooltipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const tooltips = await TooltipHarnessUtils.loader.getAllHarnesses(MatTooltipHarness.with(tooltipFilters));

        return tooltips;
    }

    static async getTooltipText({ fixture, tooltipFilters, fromRoot = false }: TooltipProps): Promise<string> {
        const tooltip = await TooltipHarnessUtils.getTooltip({ fixture, tooltipFilters, fromRoot });
        await tooltip.show();
        const tooltipText = await tooltip.getTooltipText();

        return tooltipText;
    }
}
