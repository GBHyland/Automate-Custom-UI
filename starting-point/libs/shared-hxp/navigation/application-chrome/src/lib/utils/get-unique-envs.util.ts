/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppEnv } from '../interfaces/app-env.interface';

export function getUniqueEnvs(envs: AppEnv[]) {
    const uniqueEnvValues = new Set<string>();

    return envs.filter((env: AppEnv) => {
        if (uniqueEnvValues.has(env.id)) {
            return false;
        }

        uniqueEnvValues.add(env.id);

        return true;
    });
}
