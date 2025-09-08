/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken } from '@angular/core';
import { IdentityUserService } from './identity-user.service';

export const SHARED_IDENTITY_USER_SERVICE_TOKEN = new InjectionToken<IdentityUserService>('shared-identity-user-service-token');
