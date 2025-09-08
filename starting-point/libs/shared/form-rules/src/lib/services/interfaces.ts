/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormRulesEvent } from '@alfresco/adf-core';
import { ProcessInstanceVariable } from '@alfresco/adf-process-services-cloud';
import { PayloadBody } from '../model/form-rules.model';

export interface ActionData {
    target: string;
    payload: PayloadBody;
}

export interface OnProcessFinishCondition {
    type: 'CORRELATION_KEY';
    value: string;
}

export interface HandleRuleEventOnProcessFinishData {
    process: {
        processInstanceId: string;
        correlationKey: string;
        variable: {
            [variableName: string]: ProcessInstanceVariable;
        };
    };
}

export interface OnProcessFinishData {
    action: ActionData;
    event: FormRulesEvent;
}

export const FORM_EVENTS = {
    onProcessFinish: 'onProcessFinish',
} as const;

export interface PrefillPayloadFormData {
    correlationKey: string;
    formValues: {
        [formVariable: string]: string;
    };
}

export interface UpdateFormVariableActionData extends ActionData {
    payload: PrefillPayloadFormData;
}
