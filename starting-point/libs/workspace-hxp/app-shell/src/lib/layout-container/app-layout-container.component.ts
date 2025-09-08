/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ShellLayoutComponent } from '@alfresco/adf-core/shell';
import { ApplicationChromeComponent } from '@hxp/shared-hxp/navigation/application-chrome';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { AsyncPipe } from '@angular/common';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';

@Component({
    selector: 'hxp-app-layout',
    standalone: true,
    imports: [AsyncPipe, ApplicationChromeComponent, ShellLayoutComponent],
    templateUrl: './app-layout-container.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AppLayoutContainerComponent {
    protected readonly featuresService = inject(FeaturesServiceToken);
    protected readonly applicationChromeFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_WORKSPACE_SATORI_APPLICATION_CHROME;
}
