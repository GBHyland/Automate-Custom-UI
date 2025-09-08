/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { VariableActionsService } from './variable.action.service';
import { FormFieldEvent, FormRulesEvent, FormService } from '@alfresco/adf-core';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service';
import { MockProvider } from 'ng-mocks';
import { getDatatableFormModelMock } from '../../mocks/form-rules.mock';

describe('VariableActionsService', () => {
    let actionService: VariableActionsService;
    let formService: FormService;
    let variableResolverService: VariableResolverService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [VariableActionsService, MockProvider(VariableResolverService)],
        });

        actionService = TestBed.inject(VariableActionsService);
        formService = TestBed.inject(FormService);
        variableResolverService = TestBed.inject(VariableResolverService);
    });

    it('should notify variable dependant fields after form variable change', () => {
        const newVariableValue = 'new-value';

        spyOn(variableResolverService, 'resolveExpression').and.returnValue(newVariableValue);
        const onFormVariableChangedSpy = spyOn(formService.onFormVariableChanged, 'next').and.callThrough();

        const formModel = getDatatableFormModelMock();
        const field = formModel.getFieldById('dataTable');
        const event = new FormRulesEvent('click', new FormFieldEvent(formModel, field));
        const variable = formModel.variables[0];

        actionService.execute({ target: variable.name, payload: { value: variable.value } }, event);

        expect(onFormVariableChangedSpy).toHaveBeenCalledWith({ field, data: newVariableValue });
    });
});
