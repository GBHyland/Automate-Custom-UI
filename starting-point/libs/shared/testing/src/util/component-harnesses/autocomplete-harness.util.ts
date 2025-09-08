/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness, AutocompleteHarnessFilters } from '@angular/material/autocomplete/testing';
import { BaseHarnessProps } from './components-harness.interface';
import { MatOptionHarness } from '@angular/material/core/testing';

interface ButtonProps extends BaseHarnessProps {
    autocompleteFilters?: AutocompleteHarnessFilters;
}

export class AutocompleteHarnessUtils {
    private static loader: HarnessLoader;

    public static async getAutocomplete({ fixture, autocompleteFilters, fromRoot = false }: ButtonProps): Promise<MatAutocompleteHarness> {
        AutocompleteHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const autocomplete = await AutocompleteHarnessUtils.loader.getHarness(MatAutocompleteHarness.with(autocompleteFilters));

        return autocomplete;
    }

    public static async getAutocompleteOptions({ fixture, autocompleteFilters, fromRoot = false }: ButtonProps): Promise<MatOptionHarness[]> {
        AutocompleteHarnessUtils.loader = fromRoot
            ? TestbedHarnessEnvironment.documentRootLoader(fixture)
            : TestbedHarnessEnvironment.loader(fixture);
        const autocomplete = await AutocompleteHarnessUtils.loader.getHarness(MatAutocompleteHarness.with(autocompleteFilters));

        return autocomplete.getOptions();
    }

    public static async getAutocompleteOptionsText(buttonProps: ButtonProps): Promise<string[]> {
        const options = await AutocompleteHarnessUtils.getAutocompleteOptions(buttonProps);
        const optionsText = options.map((option) => option.getText());

        return Promise.all(optionsText);
    }
}
