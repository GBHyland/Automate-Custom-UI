/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormFieldModel, FormFieldTypes, FormRulesEvent, FormService } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { PayloadBody, VARIABLE_PREFIX, VariablesInputs } from '../../model/form-rules.model';
import { HandleRuleEventOnProcessFinishData } from '../interfaces';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';

export interface VariableAction {
    target: string;
    payload: PayloadBody;
}

@Injectable({
    providedIn: 'root',
})
export class VariableActionsService {
    private variableResolverService = inject(VariableResolverService);
    private formService = inject(FormService);

    execute(action: VariableAction, event: FormRulesEvent, data?: HandleRuleEventOnProcessFinishData) {
        const variableId = action?.target?.substring(VARIABLE_PREFIX.length);

        if (!!variableId && !!action?.payload) {
            Object.keys(action.payload).forEach((variableActionPayload) => {
                switch (variableActionPayload) {
                    case VariablesInputs.VALUE: {
                        const resolvedValue = this.variableResolverService.resolveExpression(
                            action.payload[variableActionPayload],
                            event,
                            undefined,
                            data
                        );

                        event.form.changeVariableValue(variableId, resolvedValue, event);

                        const formFields: FormFieldModel[] = event.form.getFormFields();
                        const updatedVariable = event.form.variables.find((variable) => variable.id === variableId);

                        this.updateDisplayValueFiles(formFields, variableId, resolvedValue);
                        this.updateVariableDependantFields(formFields, updatedVariable);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }
    }

    private updateDisplayValueFiles(formFields: FormFieldModel[], variableId: string, variableValue: any): void {
        const displayValueFields = formFields.filter((field) => {
            return (
                field.type === FormFieldTypes.DISPLAY_VALUE &&
                field.params?.responseVariable &&
                (field.params?.field?.id === variableId || field.params?.field?.name === variableId)
            );
        });

        displayValueFields.forEach((field) => {
            field.value = variableValue;
        });
    }

    private updateVariableDependantFields(formFields: FormFieldModel[], variable: any): void {
        const dropdownFields = formFields.filter((field) => {
            return field.type === FormFieldTypes.DROPDOWN && field.optionType === 'variable' && field.variableConfig.variableName === variable.id;
        });

        const datatableFields = formFields.filter((field) => {
            const isDatatable = field.type === FormFieldTypes.DATA_TABLE;

            if (isDatatable) {
                const hasVariableConfig = !!field.variableConfig?.variableName;
                return hasVariableConfig === true ? field.variableConfig.variableName === variable.name : false;
            }

            return false;
        });

        const fieldsToUpdate = [...dropdownFields, ...datatableFields];

        for (const field of fieldsToUpdate) {
            this.formService.onFormVariableChanged.next({
                field,
                data: variable.value,
            });
        }
    }
}
