/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken } from '@angular/core';
import { HeaderConfig } from '../interfaces/header-config.interface';

export const HEADER_CONFIG_TOKEN = new InjectionToken<HeaderConfig>('header_config');
