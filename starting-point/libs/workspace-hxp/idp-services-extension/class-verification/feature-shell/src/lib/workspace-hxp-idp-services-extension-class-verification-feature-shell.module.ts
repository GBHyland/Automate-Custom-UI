/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ClassVerificationStoreModule } from './store/class-verification-store.module';
import { WorkspaceHxpIdpServicesExtensionSharedModule } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ClassVerificationScreenComponent } from './screens/class-verification-screen';
import { ScreenRenderingService } from '@alfresco/adf-process-services-cloud';

@NgModule({
    imports: [ClassVerificationStoreModule, WorkspaceHxpIdpServicesExtensionSharedModule],
})
export class WorkspaceHxpIdpServicesClassVerificationFeatureShellModule {
    constructor(screenRenderingService: ScreenRenderingService) {
        screenRenderingService.register(
            {
                'idp-class-verification': () => ClassVerificationScreenComponent,
            },
            true
        );
    }
}
