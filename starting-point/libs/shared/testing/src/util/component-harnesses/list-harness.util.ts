/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture } from '@angular/core/testing';
import { ListHarnessFilters, ListItemHarnessFilters, MatListHarness, MatListItemHarness } from '@angular/material/list/testing';

interface ListProps {
    fixture: ComponentFixture<unknown>;
    listFilters?: ListHarnessFilters;
    fromRoot?: boolean;
}

interface ListItemsProps extends ListProps {
    itemFilters?: ListItemHarnessFilters;
}

export class ListHarnessUtils {
    private static loader: HarnessLoader;

    public static async getList({ fixture, listFilters, fromRoot = false }: ListProps): Promise<MatListHarness> {
        ListHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const list = await ListHarnessUtils.loader.getHarness(MatListHarness.with(listFilters));

        return list;
    }

    public static async getAllLists({ fixture, listFilters, fromRoot = false }: ListProps): Promise<MatListHarness[]> {
        ListHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const list = await ListHarnessUtils.loader.getAllHarnesses(MatListHarness.with(listFilters));

        return list;
    }

    public static async getItems(listItemProps: ListItemsProps): Promise<MatListItemHarness[]> {
        const list = await ListHarnessUtils.getList(listItemProps);
        const items = await list.getItems(listItemProps.itemFilters);

        return items;
    }
}
