/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ButtonHarnessFilters, MatButtonHarness } from '@angular/material/button/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface ButtonProps extends BaseHarnessProps {
    buttonFilters?: ButtonHarnessFilters;
}

export class ButtonHarnessUtils {
    private static loader: HarnessLoader;

    public static async getButton({ fixture, buttonFilters, fromRoot = false }: ButtonProps): Promise<MatButtonHarness> {
        ButtonHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        return ButtonHarnessUtils.loader.getHarness(MatButtonHarness.with(buttonFilters));
    }

    public static async hasButton(props: ButtonProps): Promise<boolean> {
        const buttons = await this.getAllButtons(props);
        return buttons.length > 0;
    }

    public static async getAllButtons({ fixture, buttonFilters, fromRoot = false }: ButtonProps): Promise<MatButtonHarness[]> {
        ButtonHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        return ButtonHarnessUtils.loader.getAllHarnesses(MatButtonHarness.with(buttonFilters));
    }

    public static async clickButton(props: ButtonProps): Promise<void> {
        const button = await this.getButton(props);
        return button.click();
    }
}
