/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { type UserType } from '../config/global-variables';
import { resolve } from 'node:path';
import { paths } from '.';

export function getUserState(user: UserType) {
    return resolve(process.cwd(), `${paths.userStates}/${user}UserState.json`);
}
