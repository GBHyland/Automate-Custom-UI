/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness, CheckboxHarnessFilters } from '@angular/material/checkbox/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface CheckboxProps extends BaseHarnessProps {
    checkboxFilters?: CheckboxHarnessFilters;
}

export class CheckboxHarnessUtils {
    private static loader: HarnessLoader;

    public static async getCheckbox({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<MatCheckboxHarness> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarness(MatCheckboxHarness.with(checkboxFilters));

        return checkbox;
    }

    public static async getCheckboxOrNull({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<MatCheckboxHarness | null> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarnessOrNull(MatCheckboxHarness.with(checkboxFilters));

        return checkbox;
    }

    public static async getAllCheckboxes({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<MatCheckboxHarness[]> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const allCheckboxes = await CheckboxHarnessUtils.loader.getAllHarnesses(MatCheckboxHarness.with(checkboxFilters));

        return allCheckboxes;
    }

    public static async getCheckboxValue({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<boolean> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarness(MatCheckboxHarness.with(checkboxFilters));

        return checkbox.isChecked();
    }

    public static async toggleCheckbox({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<void> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarness(MatCheckboxHarness.with(checkboxFilters));

        return checkbox.toggle();
    }

    public static async checkboxCheck({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<void> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarness(MatCheckboxHarness.with(checkboxFilters));

        return checkbox.check();
    }

    public static async checkboxUncheck({ fixture, checkboxFilters, fromRoot = false }: CheckboxProps): Promise<void> {
        CheckboxHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const checkbox = await CheckboxHarnessUtils.loader.getHarness(MatCheckboxHarness.with(checkboxFilters));

        return checkbox.uncheck();
    }
}
