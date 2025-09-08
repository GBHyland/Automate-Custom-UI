/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta } from '@storybook/angular';
import { TableSkeletonLoaderComponent } from './table-skeleton-loader.component';

export default {
    title: 'Ui/Skeletons/Table Skeleton Loader',
    component: TableSkeletonLoaderComponent,
} as Meta<TableSkeletonLoaderComponent>;

export const Default = {};

export const CustomNumberOfRows = {
    render: (args: TableSkeletonLoaderComponent) => ({
        props: args,
    }),
    args: {
        skeletonRows: 2,
    },
};
