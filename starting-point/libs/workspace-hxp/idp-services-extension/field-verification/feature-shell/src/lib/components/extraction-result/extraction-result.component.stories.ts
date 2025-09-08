/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta, moduleMetadata } from '@storybook/angular';
import { ExtractionResultComponent } from './extraction-result.component';
import { MatIconModule } from '@angular/material/icon';
import { I18nModule } from '../../configs/storybook/i18n.module';

export default {
    title: 'ExtractionResultComponent',
    component: ExtractionResultComponent,
    decorators: [
        moduleMetadata({
            imports: [MatIconModule, I18nModule],
        }),
    ],
    // eslint-disable-next-line prettier/prettier
} satisfies Meta<ExtractionResultComponent>;

export const Primary = {
    render: (args: ExtractionResultComponent) => ({
        props: args,
    }),
    args: {},
};
