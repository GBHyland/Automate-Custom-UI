/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness, ProgressSpinnerHarnessFilters } from '@angular/material/progress-spinner/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface ProgressSpinnerProps extends BaseHarnessProps {
    progressSpinnerFilters?: ProgressSpinnerHarnessFilters;
}

export class ProgressSpinnerHarnessUtils {
    private static loader: HarnessLoader;

    public static async getProgressSpinner({
        fixture,
        progressSpinnerFilters,
        fromRoot = false,
    }: ProgressSpinnerProps): Promise<MatProgressSpinnerHarness | null> {
        ProgressSpinnerHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const spinners = await ProgressSpinnerHarnessUtils.loader.getAllHarnesses(MatProgressSpinnerHarness.with(progressSpinnerFilters));

        return spinners.length > 0 ? spinners[0] : null;
    }
}
