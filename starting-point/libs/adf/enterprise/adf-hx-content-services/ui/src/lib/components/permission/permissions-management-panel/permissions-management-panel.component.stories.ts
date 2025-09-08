/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { documentWithAcl, getApplicationConfigProviders, moduleMetadataProviders } from '../../../configs/storybook/permissions-management.mock';
import { PermissionsManagementPanelComponent } from './permissions-management-panel.component';

export default {
    title: 'Ui/Permissions Management/Panel',
    component: PermissionsManagementPanelComponent,
    decorators: [
        applicationConfig({
            providers: getApplicationConfigProviders(documentWithAcl),
        }),
        moduleMetadata({
            providers: moduleMetadataProviders,
        }),
    ],
} as Meta<PermissionsManagementPanelComponent>;

export const Panel = {
    render: (args: PermissionsManagementPanelComponent) => ({
        props: args,
    }),
    args: {
        document: documentWithAcl,
    },
};
