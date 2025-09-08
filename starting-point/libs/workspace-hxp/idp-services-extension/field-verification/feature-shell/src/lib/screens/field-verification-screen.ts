/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IdpDedicatedScreenBaseComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IDP_FIELD_VERIFICATION_SERVICES_PROVIDER } from '../services/idp-services.module';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { FieldVerificationRootComponent } from '../components/root/field-verification-root.component';

@Component({
    template: `<hyland-idp-field-verification-root *adfForFeatures="idpFeatureFlag" />`,
    styleUrls: ['./field-verification-screen.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [...IDP_FIELD_VERIFICATION_SERVICES_PROVIDER],
    imports: [FieldVerificationRootComponent, FeaturesDirective],
})
export class FieldVerificationScreenComponent extends IdpDedicatedScreenBaseComponent {}
