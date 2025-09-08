/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta } from '@storybook/angular';
import { MimeTypeIconComponent } from './mime-type-icon.component';
import { DefaultIcon } from '../configs/icons.config';
import { mimeTypeLinkedImages } from '../configs/mime-type.config';

const mimeTypeIcons: Record<string, string> = {
    [DefaultIcon.UNKNOWN]: './assets/images/Generic.svg',
    ...mimeTypeLinkedImages,
};

export default {
    title: 'Icons/Mime-Type Icon',
    component: MimeTypeIconComponent,
    argTypes: {
        mimeType: {
            options: Object.keys(mimeTypeIcons),
            control: {
                type: 'select',
            },
        },
    },
} as Meta<MimeTypeIconComponent>;

export const MimeTypeIcon = {
    render: (args: MimeTypeIconComponent) => ({
        props: args,
    }),
    args: {
        mimeType: 'image/png',
    },
};

export const UnknownMimeType = {
    render: (args: MimeTypeIconComponent) => ({
        props: args,
    }),
    args: {
        mimeType: DefaultIcon.UNKNOWN,
    },
};
