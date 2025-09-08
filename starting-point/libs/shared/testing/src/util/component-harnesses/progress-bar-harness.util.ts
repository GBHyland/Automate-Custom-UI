/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressBarHarness, ProgressBarHarnessFilters } from '@angular/material/progress-bar/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface ProgressBarProps extends BaseHarnessProps {
    progressBarFilters?: ProgressBarHarnessFilters;
}

export class ProgressBarHarnessUtils {
    private static loader: HarnessLoader;

    static async getProgressBar({ fixture, progressBarFilters, fromRoot = false }: ProgressBarProps): Promise<MatProgressBarHarness> {
        ProgressBarHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const progressBar = await ProgressBarHarnessUtils.loader.getHarness(MatProgressBarHarness.with(progressBarFilters));

        return progressBar;
    }

    static async getAllProgressBars({ fixture, progressBarFilters, fromRoot = false }: ProgressBarProps): Promise<MatProgressBarHarness[]> {
        ProgressBarHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const progressBars = await ProgressBarHarnessUtils.loader.getAllHarnesses(MatProgressBarHarness.with(progressBarFilters));

        return progressBars;
    }
}
