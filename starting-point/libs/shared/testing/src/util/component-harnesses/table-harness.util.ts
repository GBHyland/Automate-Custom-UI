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
import {
    CellHarnessFilters,
    MatHeaderCellHarness,
    MatRowHarness,
    MatTableHarness,
    RowHarnessFilters,
    TableHarnessFilters,
} from '@angular/material/table/testing';

interface TableProps {
    fixture: ComponentFixture<unknown>;
    tableFilters?: TableHarnessFilters;
    fromRoot?: boolean;
}

interface TableCellProps extends TableProps {
    cellFilters?: CellHarnessFilters;
}

interface TableRowProps extends TableProps {
    rowFilters?: RowHarnessFilters;
}

export class TableHarnessUtils {
    private static loader: HarnessLoader;

    public static async getTable({ fixture, tableFilters, fromRoot = false }: TableProps) {
        TableHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const table = await TableHarnessUtils.loader.getHarness(MatTableHarness.with(tableFilters));

        return table;
    }

    public static async getAllTables({ fixture, tableFilters, fromRoot = false }: TableProps): Promise<MatTableHarness[]> {
        TableHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const tables = await TableHarnessUtils.loader.getAllHarnesses(MatTableHarness.with(tableFilters));

        return tables;
    }

    public static async getHeaderCell(cellProps: TableCellProps) {
        const table = await TableHarnessUtils.getTable(cellProps);
        const cell = await table.getHarness(MatHeaderCellHarness.with(cellProps.cellFilters));

        return cell;
    }

    public static async getRow(tableRowProps: TableRowProps): Promise<MatRowHarness> {
        const table = await TableHarnessUtils.getTable(tableRowProps);
        const row = await table.getHarness(MatRowHarness.with(tableRowProps.rowFilters));

        return row;
    }

    public static async getRows(tableRowProps: TableRowProps): Promise<MatRowHarness[]> {
        const table = await TableHarnessUtils.getTable(tableRowProps);
        const rows = await table.getRows(tableRowProps.rowFilters);

        return rows;
    }
}
