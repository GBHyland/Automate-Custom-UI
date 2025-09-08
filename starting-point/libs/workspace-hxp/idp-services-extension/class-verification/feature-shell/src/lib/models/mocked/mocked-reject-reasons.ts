/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpRejectReason } from '../screen-models';

export function mockIdpRejectReasons(): IdpRejectReason[] {
    return [
        {
            id: 'rr1',
            value: 'Reject reason 1',
        },
        {
            id: 'rr2',
            value: 'Reject reason 2',
        },
        {
            id: 'rr3',
            value: 'Reject reason 3',
        },
    ];
}
