/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { ComponentFixture } from '@angular/core/testing';
import { SelectHarnessFilters } from '@angular/material/select/testing';
import { ListOptionHarnessFilters, MatListOptionHarness, MatSelectionListHarness } from '@angular/material/list/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

interface SelectionListProps {
    fixture: ComponentFixture<unknown>;
    selectionListFilters?: SelectHarnessFilters;
    fromRoot?: boolean;
}

interface SelectionListOptionsProps extends SelectionListProps {
    optionFilters?: ListOptionHarnessFilters;
}

export class SelectionListHarnessUtils {
    private static loader: HarnessLoader;

    public static async getSelectionList({ fixture, selectionListFilters, fromRoot = false }: SelectionListProps): Promise<MatSelectionListHarness> {
        SelectionListHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);

        const selectionList = await SelectionListHarnessUtils.loader.getHarness(MatSelectionListHarness.with(selectionListFilters));

        return selectionList;
    }

    public static async getOptions(selectionListOptionsProps: SelectionListOptionsProps): Promise<MatListOptionHarness[]> {
        const selectionList = await SelectionListHarnessUtils.getSelectionList(selectionListOptionsProps);

        return selectionList.getItems(selectionListOptionsProps.optionFilters);
    }

    public static async selectOptions(selectionListOptionsProps: SelectionListOptionsProps): Promise<void> {
        const selectionList = await SelectionListHarnessUtils.getSelectionList(selectionListOptionsProps);

        return selectionList.selectItems({ ...selectionListOptionsProps.optionFilters });
    }
}
