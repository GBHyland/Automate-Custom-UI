/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom } from '../../../../utils';

/**
 * Create tenant JSON Object
 *
 * @param details - JSON object used to overwrite the default values
 * @constructor
 */
export class Tenant {
    active = true;
    configuration = 'DefaultConfig';
    domain = 'DefaultDomain';
    maxUsers = 10;
    name = UtilRandom.generateAlphaLowerCase(8);

    constructor(details?: any) {
        Object.assign(this, details);
    }
}
