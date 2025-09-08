/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseHarnessProps } from './components-harness.interface';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCardHarness, CardHarnessFilters } from '@angular/material/card/testing';

interface CardProps extends BaseHarnessProps {
    cardFilters?: CardHarnessFilters;
}

export class CardHarnessUtils {
    private static loader: HarnessLoader;

    public static async getCard({ fixture, cardFilters, fromRoot = false }: CardProps): Promise<MatCardHarness> {
        CardHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const card = await CardHarnessUtils.loader.getHarness(MatCardHarness.with(cardFilters));

        return card;
    }

    public static async getCardTitle(cardProps: CardProps): Promise<string> {
        const card = await CardHarnessUtils.getCard(cardProps);

        return card.getTitleText();
    }

    public static async getCardSubtitle(cardProps: CardProps): Promise<string> {
        const card = await CardHarnessUtils.getCard(cardProps);

        return card.getSubtitleText();
    }
}
