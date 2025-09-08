/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginatorHarness, PaginatorHarnessFilters } from '@angular/material/paginator/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface PaginatorProps extends BaseHarnessProps {
    paginatorFilters?: PaginatorHarnessFilters;
}

export class PaginatorHarnessUtils {
    private static loader: HarnessLoader;

    public static async getPaginator({ fixture, paginatorFilters, fromRoot = false }: PaginatorProps): Promise<MatPaginatorHarness> {
        PaginatorHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const paginator = await PaginatorHarnessUtils.loader.getHarness(MatPaginatorHarness.with(paginatorFilters));

        return paginator;
    }

    public static async getAllPaginator({ fixture, paginatorFilters, fromRoot = false }: PaginatorProps): Promise<MatPaginatorHarness[]> {
        PaginatorHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const paginator = await PaginatorHarnessUtils.loader.getAllHarnesses(MatPaginatorHarness.with(paginatorFilters));

        return paginator;
    }

    public static async goToNext(paginatorProps: PaginatorProps): Promise<void> {
        const paginator = await PaginatorHarnessUtils.getPaginator(paginatorProps);
        await paginator.goToNextPage();
    }
}
