/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IdpDedicatedScreenBaseComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ClassVerificationRootComponent } from '../components/root/class-verification-root.component';
import { IDP_CLASS_VERIFICATION_SERVICES_PROVIDER } from '../services/idp-services.module';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';

@Component({
    template: `<hyland-idp-class-verification-root *adfForFeatures="idpFeatureFlag" />`,
    styleUrls: ['./class-verification-screen.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [...IDP_CLASS_VERIFICATION_SERVICES_PROVIDER],
    imports: [ClassVerificationRootComponent, FeaturesDirective],
})
export class ClassVerificationScreenComponent extends IdpDedicatedScreenBaseComponent {}
