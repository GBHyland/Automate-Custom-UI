/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';

export const initialiseExtension = createAction(
    '[Process Service Cloud Extension] initialise',
    props<{
        health: boolean;
        application: string;
    }>()
);

export const taskOrProcessFilterUpdate = createAction(
    '[Process Service Cloud Extension] task or process filter updated',
    props<{ filterKey: string; canBeRefreshed: boolean }>()
);
