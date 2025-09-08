/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormEvent, FormRulesEvent, FormService } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { FIELD_PREFIX, FieldInputs, FormActionsUtils, PayloadBody } from '../../model/form-rules.model';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';
import { HandleRuleEventOnProcessFinishData } from '../interfaces';

@Injectable({
    providedIn: 'root',
})
export class FieldActionsService {
    private variableResolver = inject(VariableResolverService);
    private formService = inject(FormService);

    execute(
        action: { target: string; payload: PayloadBody },
        event: FormRulesEvent,
        filterMatched: boolean,
        data?: HandleRuleEventOnProcessFinishData
    ) {
        const fieldId = action?.target?.substring(FIELD_PREFIX.length);

        if (!!fieldId && !!action?.payload) {
            Object.keys(action.payload).forEach((fieldAction) => {
                const isBooleanActionType = FormActionsUtils.getType(fieldAction) === 'boolean';
                const value = isBooleanActionType && !filterMatched ? !action.payload[fieldAction] : action.payload[fieldAction];

                switch (fieldAction) {
                    case FieldInputs.DISABLED:
                        event.form.changeFieldDisabled(fieldId, value);
                        break;
                    case FieldInputs.DISPLAY:
                        event.form.changeFieldVisibility(fieldId, value);
                        break;
                    case FieldInputs.REQUIRED:
                        event.form.changeFieldRequired(fieldId, value);
                        break;
                    case FieldInputs.VALUE:
                        if (filterMatched) {
                            const resolvedValue = this.variableResolver.resolveExpression(value, event, false, data);
                            event.form.changeFieldValue(fieldId, resolvedValue);

                            // Handle reactive widgets
                            const onFormLoadedEvent = new FormEvent(event.form);
                            const formRules = new FormRulesEvent('fieldValueChanged', onFormLoadedEvent);
                            const onProcessFinishRule = new FormRulesEvent('fieldValueChanged', formRules);
                            this.formService.formRulesEvent.next(onProcessFinishRule);
                        }
                        break;
                    default:
                        break;
                }
            });
        }
    }
}
