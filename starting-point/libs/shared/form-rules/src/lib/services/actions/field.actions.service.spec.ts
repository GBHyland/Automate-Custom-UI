/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FormEvent, FormFieldEvent, FormRulesEvent, FormService } from '@alfresco/adf-core';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';
import { MockProvider } from 'ng-mocks';
import { getDatatableFormModelMock } from '../../mocks/form-rules.mock';
import { FieldActionsService } from './field-actions.service';

describe('FieldActionsService', () => {
    let fieldActionService: FieldActionsService;
    let formService: FormService;
    let variableResolverService: VariableResolverService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FieldActionsService, MockProvider(VariableResolverService)],
        });

        fieldActionService = TestBed.inject(FieldActionsService);
        formService = TestBed.inject(FormService);
        variableResolverService = TestBed.inject(VariableResolverService);
    });

    it('should emit form rule event on value change', () => {
        const newVariableValue = 'new-value';

        spyOn(variableResolverService, 'resolveExpression').and.returnValue(newVariableValue);
        const onFormRulesEventSpy = spyOn(formService.formRulesEvent, 'next').and.callThrough();

        const formModel = getDatatableFormModelMock();
        const field = formModel.getFieldById('dataTable');
        const event = new FormRulesEvent('click', new FormFieldEvent(formModel, field));
        const variable = formModel.variables[0];

        fieldActionService.execute({ target: `field.${field.id}`, payload: { value: variable.value } }, event, true);

        const onFormLoadedEvent = new FormEvent(event.form);
        const formRules = new FormRulesEvent('fieldValueChanged', onFormLoadedEvent);
        const onProcessFinishRule = new FormRulesEvent('fieldValueChanged', formRules);

        expect(onFormRulesEventSpy).toHaveBeenCalledWith(onProcessFinishRule);
    });
});
