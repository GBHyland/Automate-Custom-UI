/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness, InputHarnessFilters } from '@angular/material/input/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface FormFieldProps extends BaseHarnessProps {
    inputFilters?: InputHarnessFilters;
}

export class InputHarnessUtils {
    private static loader: HarnessLoader;

    public static async getInput({ fixture, inputFilters, fromRoot = false }: FormFieldProps): Promise<MatInputHarness> {
        InputHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const formField = await InputHarnessUtils.loader.getHarness(MatInputHarness.with(inputFilters));

        return formField;
    }

    public static async getInputOrNull({ fixture, inputFilters, fromRoot = false }: FormFieldProps): Promise<MatInputHarness | null> {
        InputHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const formField = await InputHarnessUtils.loader.getHarnessOrNull(MatInputHarness.with(inputFilters));

        return formField;
    }

    public static async getAllInputs({ fixture, inputFilters, fromRoot = false }: FormFieldProps): Promise<MatInputHarness[]> {
        InputHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const allFormFields = await InputHarnessUtils.loader.getAllHarnesses(MatInputHarness.with(inputFilters));

        return allFormFields;
    }

    public static async getInputValue(formFieldProps: FormFieldProps): Promise<string> {
        const formField = await InputHarnessUtils.getInput(formFieldProps);

        return formField.getValue();
    }

    public static async setInputValue(formFieldProps: FormFieldProps, value: string): Promise<void> {
        const formField = await InputHarnessUtils.getInput(formFieldProps);

        await formField.setValue(value);

        return formField.blur();
    }
}
