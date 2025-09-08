/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { MatSelectHarness, SelectHarnessFilters } from '@angular/material/select/testing';
import { OptgroupHarnessFilters, OptionHarnessFilters, MatOptionHarness, MatOptgroupHarness } from '@angular/material/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { BaseHarnessProps } from './components-harness.interface';

interface DropdownProps extends BaseHarnessProps {
    dropdownFilters?: SelectHarnessFilters;
}
interface DropdownOptionsProps extends DropdownProps {
    optionsFilters?: OptionHarnessFilters;
}

interface DropdownGroupsProps extends DropdownOptionsProps {
    groupsFilters?: OptgroupHarnessFilters;
}

export class SelectHarnessUtils {
    private static loader: HarnessLoader;

    public static async getDropdown({ fixture, dropdownFilters, fromRoot = false }: DropdownProps): Promise<MatSelectHarness> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));

        return dropdown;
    }

    public static async getAllDropdowns({ fixture, dropdownFilters, fromRoot = false }: DropdownProps): Promise<MatSelectHarness[]> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const allDropdowns = await SelectHarnessUtils.loader.getAllHarnesses(MatSelectHarness.with(dropdownFilters));

        return allDropdowns;
    }

    public static async getDropdownOptions({ fixture, optionsFilters, dropdownFilters, fromRoot = false }: DropdownOptionsProps): Promise<string[]> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));
        await dropdown.open();
        const options = await dropdown.getOptions(optionsFilters);
        const optionTexts = options.map((option: MatOptionHarness) => option.getText());

        return Promise.all(optionTexts);
    }

    public static async getDropdownOptionsByGroup({
        fixture,
        groupsFilters,
        optionsFilters,
        dropdownFilters,
        fromRoot = false,
    }: DropdownGroupsProps): Promise<string[]> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));
        await dropdown.open();
        const optionsGroups = await dropdown.getOptionGroups(groupsFilters);

        const options = await optionsGroups[0].getOptions(optionsFilters);
        const optionTexts = options?.map((option: MatOptionHarness) => option.getText());

        return Promise.all(optionTexts);
    }

    public static async getDropdownOptionGroups({
        fixture,
        groupsFilters,
        dropdownFilters,
        fromRoot = false,
    }: DropdownGroupsProps): Promise<string[]> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));
        await dropdown.open();
        const optionsGroups = await dropdown.getOptionGroups(groupsFilters);

        const optionsGroupTexts = optionsGroups?.map((optionsGroup: MatOptgroupHarness) => optionsGroup.getLabelText());

        return Promise.all(optionsGroupTexts);
    }

    public static async clickDropdownOptions({ fixture, optionsFilters, dropdownFilters, fromRoot = false }: DropdownOptionsProps): Promise<void> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));
        await dropdown.open();

        return dropdown.clickOptions(optionsFilters);
    }

    public static async clickDropdownOptionByIndex(dropdownProps: DropdownProps, index: number): Promise<void> {
        const dropdown = await SelectHarnessUtils.getDropdown(dropdownProps);
        await dropdown.open();
        const options = await dropdown.getOptions();

        return options[index].click();
    }

    public static async getDropdownValue({ fixture, dropdownFilters, fromRoot = false }: DropdownProps): Promise<string> {
        SelectHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const dropdown = await SelectHarnessUtils.loader.getHarness(MatSelectHarness.with(dropdownFilters));

        return dropdown.getValueText();
    }
}
