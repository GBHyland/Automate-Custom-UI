/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta } from '@storybook/angular';
import { FolderIconComponent } from './folder-icon.component';

export default {
    title: 'Icons/Folder Icon',
    component: FolderIconComponent,
} as Meta<FolderIconComponent>;

export const Default = {};

export const Expanded = {
    render: (args: FolderIconComponent) => ({
        props: args,
    }),
    args: {
        isExpanded: true,
    },
};

export const NotExpanded = {
    render: (args: FolderIconComponent) => ({
        props: args,
    }),
    args: {
        isExpanded: false,
    },
};
