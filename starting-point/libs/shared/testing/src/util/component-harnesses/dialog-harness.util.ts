/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDialogHarness, DialogHarnessFilters } from '@angular/material/dialog/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface DialogProps extends BaseHarnessProps {
    dialogFilters?: DialogHarnessFilters;
}

export class DialogHarnessUtils {
    private static loader: HarnessLoader;

    public static async getDialog({ fixture, dialogFilters, fromRoot = false }: DialogProps): Promise<MatDialogHarness> {
        DialogHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const dialog = await DialogHarnessUtils.loader.getHarness(MatDialogHarness.with(dialogFilters));

        return dialog;
    }

    public static async getDialogTitle(dialogProps: DialogProps): Promise<string> {
        const dialog = await DialogHarnessUtils.getDialog(dialogProps);

        return dialog.getTitleText();
    }
}
