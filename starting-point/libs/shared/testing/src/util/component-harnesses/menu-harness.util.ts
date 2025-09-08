/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness, MatMenuItemHarness, MenuHarnessFilters, MenuItemHarnessFilters } from '@angular/material/menu/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface MenuProps extends BaseHarnessProps {
    menuFilters?: MenuHarnessFilters;
}

interface MenuItemProps extends BaseHarnessProps {
    menuItemFilters?: MenuItemHarnessFilters;
}

export class MenuHarnessUtils {
    private static loader: HarnessLoader;

    public static async getMenuItem({ fixture, menuItemFilters, fromRoot = false }: MenuItemProps): Promise<MatMenuItemHarness> {
        MenuHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        return MenuHarnessUtils.loader.getHarness(MatMenuItemHarness.with(menuItemFilters));
    }

    public static async getMenuItemOrNull({ fixture, menuItemFilters, fromRoot = false }: MenuItemProps): Promise<MatMenuItemHarness | null> {
        MenuHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        return MenuHarnessUtils.loader.getHarnessOrNull(MatMenuItemHarness.with(menuItemFilters));
    }

    public static async clickMenuItem({ fixture, menuItemFilters, fromRoot = false }: MenuItemProps): Promise<void> {
        MenuHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const menuItem = await MenuHarnessUtils.loader.getHarness(MatMenuItemHarness.with(menuItemFilters));

        return menuItem.click();
    }

    public static async getMenu({ fixture, menuFilters, fromRoot = false }: MenuProps): Promise<MatMenuHarness> {
        MenuHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        return MenuHarnessUtils.loader.getHarness(MatMenuHarness.with(menuFilters));
    }

    public static async getAllMenu({ fixture, menuFilters, fromRoot = false }: MenuProps): Promise<MatMenuHarness[]> {
        MenuHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        return MenuHarnessUtils.loader.getAllHarnesses(MatMenuHarness.with(menuFilters));
    }

    public static async openMenu(menuProps: MenuProps): Promise<void> {
        return (await MenuHarnessUtils.getMenu(menuProps)).open();
    }
}
