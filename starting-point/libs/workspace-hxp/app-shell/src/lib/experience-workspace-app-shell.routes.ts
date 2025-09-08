/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Routes } from '@angular/router';
import { ExtensionsDataLoaderGuard } from './extensions/extensions-data-loader.guard';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '@alfresco/adf-core';
import { FeatureFlagsWrapperComponent, IsFlagsOverrideOn } from '@alfresco/adf-core/feature-flags';
import { AppLayoutContainerComponent } from './layout-container/app-layout-container.component';

export const APP_ROUTES: Routes = [
    {
        path: 'flags',
        component: FeatureFlagsWrapperComponent,
        canMatch: [IsFlagsOverrideOn],
    },
    {
        path: '',
        component: AppLayoutContainerComponent,
        canActivate: [ExtensionsDataLoaderGuard],
        children: [
            {
                path: '',
                canActivate: [AuthGuard],
                component: HomeComponent,
                pathMatch: 'full',
            },
            {
                path: 'task-details-cloud/:id',
                loadChildren: () =>
                    import('@hxp/workspace-hxp/idp-services-extension/class-verification/feature-shell').then(
                        (m) => m.WorkspaceHxpIdpServicesClassVerificationFeatureShellModule
                    ),
            },
        ],
    },
];
