/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ACE } from '@hylandsoftware/hxcs-js-client';

// ACE model have every props optional, but some of them are required to have a valid/meaningful permission:
// - ACE creator and permission value
type BaseRequiredAce = ACE & Required<Pick<ACE, 'creator' | 'permission' | 'granted'>>;

// - one between user and group depending on the permission subject
type UserRequiredAce = BaseRequiredAce & Required<Pick<BaseRequiredAce, 'user'>>;
type GroupRequiredAce = BaseRequiredAce & Required<Pick<BaseRequiredAce, 'group'>>;

export type RequiredAce = UserRequiredAce | GroupRequiredAce;
