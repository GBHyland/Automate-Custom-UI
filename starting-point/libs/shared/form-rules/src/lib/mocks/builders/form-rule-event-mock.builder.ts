/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormRuleEventPayload, FormRuleEventAction, FormRules } from '../../model/form-rules.model';
import { START_PROCESS_TARGET } from '../../services/actions/start-process/start-process-action.service';

export class FormRuleEventPayloadMockBuilder {
    private formRuleEventPayload: FormRuleEventPayload = {
        actions: [],
    };

    withStartProcessAction(startProcessPayload: { correlationKey: string; processName: string }): this {
        this.formRuleEventPayload.actions.push({
            target: START_PROCESS_TARGET,
            payload: startProcessPayload,
        });

        return this;
    }

    withAction(action: FormRuleEventAction): this {
        this.formRuleEventPayload.actions.push(action);
        return this;
    }

    withPredicateFilter(filter: any): this {
        if (!this.formRuleEventPayload.filter) {
            this.formRuleEventPayload.filter = filter;
        } else {
            (this.formRuleEventPayload.filter as any).conditions.push(...filter.conditions);
        }

        return this;
    }

    build(): FormRuleEventPayload {
        return this.formRuleEventPayload;
    }
}

export class FormRulesMockBuilder {
    private formRules: FormRules = {
        form: {},
        fields: {},
    };

    withFormEvent(
        eventName: 'onProcessFinish' | 'formLoaded',
        payloadBuilderCallback: (payloadBuilder: FormRuleEventPayloadMockBuilder) => FormRuleEventPayload
    ): this {
        const eventPayload = payloadBuilderCallback(new FormRuleEventPayloadMockBuilder());
        if (!this.formRules.form[eventName]) {
            this.formRules.form[eventName] = [];
        }

        this.formRules.form[eventName].push(eventPayload);

        return this;
    }

    build(): FormRules {
        return this.formRules;
    }
}
