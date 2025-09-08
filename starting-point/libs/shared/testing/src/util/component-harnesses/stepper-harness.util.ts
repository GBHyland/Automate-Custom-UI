/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatStepperHarness, StepHarnessFilters, StepperHarnessFilters } from '@angular/material/stepper/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface StepperProps extends BaseHarnessProps {
    stepperFilters?: StepperHarnessFilters;
}

interface StepProps extends StepperProps {
    stepFilters?: StepHarnessFilters;
}

export class StepperHarnessUtils {
    private static loader: HarnessLoader;

    public static async getStepper({ fixture, stepperFilters, fromRoot = false }: StepperProps): Promise<MatStepperHarness> {
        StepperHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const stepper = await StepperHarnessUtils.loader.getHarness(MatStepperHarness.with(stepperFilters));

        return stepper;
    }

    public static async getStepperLabels(stepProps: StepProps): Promise<string[]> {
        const stepper = await StepperHarnessUtils.getStepper(stepProps);

        const steps = await stepper.getSteps(stepProps.stepFilters);

        return Promise.all(steps.map((step) => step.getLabel()));
    }

    public static async selectStep(stepProps: StepProps): Promise<void> {
        const stepper = await StepperHarnessUtils.getStepper(stepProps);

        return stepper.selectStep(stepProps.stepFilters);
    }
}
