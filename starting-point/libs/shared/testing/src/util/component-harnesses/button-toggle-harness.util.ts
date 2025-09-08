/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonToggleHarness, ButtonToggleHarnessFilters } from '@angular/material/button-toggle/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface ButtonProps extends BaseHarnessProps {
    buttonToggleFilters?: ButtonToggleHarnessFilters;
}

export class ButtonToggleHarnessUtils {
    private static loader: HarnessLoader;

    public static async getButtonToggle({ fixture, buttonToggleFilters, fromRoot = false }: ButtonProps): Promise<MatButtonToggleHarness> {
        ButtonToggleHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const buttonToggle = await ButtonToggleHarnessUtils.loader.getHarness(MatButtonToggleHarness.with(buttonToggleFilters));

        return buttonToggle;
    }
}
