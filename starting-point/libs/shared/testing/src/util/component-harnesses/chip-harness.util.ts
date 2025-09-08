/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { BaseHarnessProps } from './components-harness.interface';
import {
    ChipListboxHarnessFilters,
    ChipGridHarnessFilters,
    ChipOptionHarnessFilters,
    MatChipListboxHarness,
    MatChipOptionHarness,
    MatChipRemoveHarness,
    ChipHarnessFilters,
    MatChipRowHarness,
    MatChipGridHarness,
    ChipRowHarnessFilters,
    MatChipHarness,
    MatChipSetHarness,
} from '@angular/material/chips/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

interface ChipProps extends BaseHarnessProps {
    chipOptionFilters?: ChipOptionHarnessFilters;
    chipFilters?: ChipHarnessFilters;
    chipRowFilter?: ChipRowHarnessFilters;
}

interface ChipListProps extends ChipProps {
    chipListFilters?: ChipListboxHarnessFilters;
}
interface ChipSetProps extends ChipProps {
    chipSetFilters?: ChipListboxHarnessFilters;
}

interface ChipGridProps extends ChipProps {
    chipGridFilters?: ChipGridHarnessFilters;
}

export class ChipHarnessUtils {
    private static loader: HarnessLoader;

    public static async getChipList({ fixture, chipListFilters, fromRoot = false }: ChipListProps): Promise<MatChipListboxHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chipList = await ChipHarnessUtils.loader.getHarness(MatChipListboxHarness.with(chipListFilters));

        return chipList;
    }

    public static async getChipSet({ fixture, chipSetFilters, fromRoot = false }: ChipSetProps): Promise<MatChipSetHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chipSet = await ChipHarnessUtils.loader.getHarness(MatChipSetHarness.with(chipSetFilters));

        return chipSet;
    }

    public static async getChipGrid({ fixture, chipGridFilters, fromRoot = false }: ChipGridProps): Promise<MatChipGridHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chipGrid = await ChipHarnessUtils.loader.getHarness(MatChipGridHarness.with(chipGridFilters));

        return chipGrid;
    }

    public static async getAllChipLists({ fixture, chipListFilters, fromRoot = false }: ChipListProps): Promise<MatChipListboxHarness[]> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const allChipLists = await ChipHarnessUtils.loader.getAllHarnesses(MatChipListboxHarness.with(chipListFilters));

        return allChipLists;
    }

    public static async getChipOption({ fixture, chipFilters, fromRoot = false }: ChipProps): Promise<MatChipOptionHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chip = await ChipHarnessUtils.loader.getHarness(MatChipOptionHarness.with(chipFilters));

        return chip;
    }

    public static async getChipRow({ fixture, chipFilters, fromRoot = false }: ChipProps): Promise<MatChipRowHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chip = await ChipHarnessUtils.loader.getHarness(MatChipRowHarness.with(chipFilters));

        return chip;
    }

    public static async getChip({ fixture, chipFilters, fromRoot = false }: ChipProps): Promise<MatChipHarness> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chip = await ChipHarnessUtils.loader.getHarness(MatChipHarness.with(chipFilters));

        return chip;
    }

    public static async getAllChips({ fixture, chipFilters, fromRoot = false }: ChipProps): Promise<MatChipHarness[]> {
        ChipHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const chips = await ChipHarnessUtils.loader.getAllHarnesses(MatChipHarness.with(chipFilters));

        return chips;
    }

    public static async getChipRows({ fixture, chipGridFilters, chipRowFilter, fromRoot = false }: ChipGridProps): Promise<MatChipRowHarness[]> {
        const chipGrid = await ChipHarnessUtils.getChipGrid({ fixture, chipGridFilters, fromRoot });

        return chipGrid.getRows(chipRowFilter);
    }

    public static async getChips({ fixture, chipListFilters, chipOptionFilters, fromRoot = false }: ChipListProps): Promise<MatChipOptionHarness[]> {
        const chipList = await ChipHarnessUtils.getChipList({ fixture, chipListFilters, fromRoot });

        return chipList.getChips(chipOptionFilters);
    }

    public static async removeChipListItems(chipListProps: ChipListProps): Promise<void[]> {
        const chips = await ChipHarnessUtils.getChips(chipListProps);

        const deselection = chips.map((chip) => chip.remove());

        return Promise.all(deselection);
    }

    public static async removeChipRowItems(chipRowProps: ChipGridProps): Promise<void[]> {
        const chips = await ChipHarnessUtils.getChipRows(chipRowProps);

        const deselection = chips.map((chip) => chip.remove());

        return Promise.all(deselection);
    }

    public static async isRemovable(chipProps: ChipProps): Promise<boolean> {
        const chip = await ChipHarnessUtils.getChipOption(chipProps);

        const chipRemoveButton = await chip.getHarnessOrNull(MatChipRemoveHarness);

        return !!chipRemoveButton;
    }

    public static async isEditable(chipProps: ChipProps): Promise<boolean> {
        const chip = await ChipHarnessUtils.getChipRow(chipProps);

        return chip.isEditable();
    }
}
