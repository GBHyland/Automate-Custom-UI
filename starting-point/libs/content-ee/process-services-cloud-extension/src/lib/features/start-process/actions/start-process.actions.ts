/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { NodeEntry } from '@alfresco/js-api';

interface ModalConfiguration {
    focusedElementOnCloseSelector?: string;
}

export interface StartProcessPayload {
    payload: NodeEntry[];
    configuration?: ModalConfiguration;
}

export const startProcess = createAction('[ProcessServicesCloud] StartProcess', props<StartProcessPayload>());
