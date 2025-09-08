/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta, moduleMetadata } from '@storybook/angular';
import { SearchActionIconComponent } from './search-action-icon.component';
import { SearchIconAssets } from '../configs/search-icons.config';
import { I18nModule } from '../configs/storybook/i18n.module';

export default {
    title: 'Icons/Search Action Icon',
    component: SearchActionIconComponent,
    decorators: [
        moduleMetadata({
            imports: [I18nModule],
        }),
    ],
    argTypes: {
        actionIcon: {
            options: Object.keys(SearchIconAssets),
            control: {
                type: 'select',
            },
        },
    },
} as Meta<SearchActionIconComponent>;

export const Default = {};

export const Search = {
    render: (args: SearchActionIconComponent) => ({
        props: args,
    }),
    args: {
        actionIcon: 'SEARCH',
    },
};

export const Clear = {
    render: (args: SearchActionIconComponent) => ({
        props: args,
    }),
    args: {
        actionIcon: 'CLEAR',
    },
};

export const AlternativeText = {
    render: (args: SearchActionIconComponent) => ({
        props: args,
    }),
    args: {
        actionAlt: 'A custom text for HTML <img> alt attribute',
    },
};
