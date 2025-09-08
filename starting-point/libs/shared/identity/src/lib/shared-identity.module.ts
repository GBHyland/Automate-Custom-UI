/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { SHARED_IDENTITY_USER_SERVICE_TOKEN } from './services/identity-user-service.token';
import { IdentityUserService } from './services/identity-user.service';
import { SHARED_IDENTITY_GROUP_SERVICE_TOKEN } from './services/identity-group-service.token';
import { IdentityGroupService } from './services/identity-group.service';
import { provideTranslations } from '@alfresco/adf-core';

@NgModule({
    providers: [
        provideTranslations('shared-identity', 'assets/shared-identity'),
        {
            provide: SHARED_IDENTITY_USER_SERVICE_TOKEN,
            useExisting: IdentityUserService,
        },
        {
            provide: SHARED_IDENTITY_GROUP_SERVICE_TOKEN,
            useExisting: IdentityGroupService,
        },
    ],
})
export class SharedIdentityModule {}
