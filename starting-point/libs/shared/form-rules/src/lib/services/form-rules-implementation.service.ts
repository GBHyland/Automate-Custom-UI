/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormService, FormRulesEvent, FormRulesManager, FormEvent, FormModel } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { takeUntil } from 'rxjs';
import { FIELD_PREFIX, FormRuleEventPayload, FormRules, FORM_PREFIX, VARIABLE_PREFIX } from '../model/form-rules.model';
import { ActionData, HandleRuleEventOnProcessFinishData } from './interfaces';
import { VariableResolverService } from './variable-resolver/variable-resolver.service';
import { FieldActionsService } from './actions/field-actions.service';
import { FormActionsService } from './actions/form-action.service';
import { VariableActionsService } from './actions/variable.action.service';
import { StartProcessActionService } from './actions/start-process/start-process-action.service';
import { EventFiltersService } from './event-filters/event-filters.service';

@Injectable({
    providedIn: 'root',
})
export class FormRulesImplementationService extends FormRulesManager<FormRules> {
    private fieldActionsService = inject(FieldActionsService);
    private formActionService = inject(FormActionsService);
    private variableActionService = inject(VariableActionsService);
    private startProcessActionService = inject(StartProcessActionService);

    private eventFiltersService = inject(EventFiltersService);
    private variableResolver = inject(VariableResolverService);

    constructor(formService: FormService) {
        super(formService);
    }

    override initialize(formModel: FormModel): void {
        super.initialize(formModel);

        this.startProcessActionService.onProcessFinishTrigger$.pipe(takeUntil(this.onDestroy$)).subscribe((processData) => {
            const onFormLoadedEvent = new FormEvent(this.formModel);
            const formRules = new FormRulesEvent('onProcessFinish', onFormLoadedEvent);
            const onProcessFinishRule = new FormRulesEvent('onProcessFinish', formRules);

            this.handleRuleEvent(onProcessFinishRule, this.getRules(), processData);
        });
    }

    protected getEventKeys(rules: any) {
        return Object.keys(rules.form);
    }

    protected getRules(): FormRules {
        return this.formModel?.json?.rules;
    }

    protected handleRuleEvent(event: FormRulesEvent, rules: FormRules, data?: HandleRuleEventOnProcessFinishData): void {
        this.formModel = event.form;
        this.variableResolver.clearContext();

        const eventType = event.type;
        let rulesPayload: FormRuleEventPayload[];

        if (eventType) {
            if (event.field) {
                rulesPayload = rules?.fields?.[event.field?.id]?.[eventType] || [];
            } else {
                rulesPayload = rules?.form?.[eventType] || [];
            }

            rulesPayload.forEach((rulePayload) => {
                const filterResult = this.eventFiltersService.eventMatchesRule(event, rulePayload.filter, data);

                this.executeActions(event, rulePayload.actions, filterResult, data);
            });
        }
    }

    private executeActions(event: FormRulesEvent, actions: ActionData[], filterMatched: boolean, data?: HandleRuleEventOnProcessFinishData) {
        if (actions?.length) {
            actions.forEach((action) => {
                if (action.target.startsWith(FORM_PREFIX) && filterMatched) {
                    this.formActionService.execute(action, event.form);
                } else if (action.target.startsWith(VARIABLE_PREFIX) && filterMatched) {
                    this.variableActionService.execute(action, event, data);
                } else if (action.target.startsWith(FIELD_PREFIX)) {
                    this.fieldActionsService.execute(action, event, filterMatched, data);
                } else if (action.target === 'toggleSpinner') {
                    this.formActionService.toggleSpinnerEvent(action);
                } else if (this.startProcessActionService.isStartProcessAction(action) && filterMatched) {
                    const hasField = !!event.field;

                    if (hasField) {
                        if (event.field.isValid) {
                            this.startProcessActionService.startProcessAction(action, event);
                        }
                    } else {
                        this.startProcessActionService.startProcessAction(action, event);
                    }
                }
            });
        }
    }
}
