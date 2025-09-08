/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormModel, FormService, FormSpinnerEvent } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { PayloadBody, FORM_PREFIX, FormActions } from '../../model/form-rules.model';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActionData } from '../interfaces';

@Injectable({
    providedIn: 'root',
})
export class FormActionsService {
    private formService = inject(FormService);

    execute(action: { target: string; payload: PayloadBody }, form: FormModel) {
        const actionType = action.target.substring(FORM_PREFIX.length);

        switch (actionType) {
            case FormActions.VALIDATE:
                form.validateForm();
                break;

            default:
                break;
        }
    }

    toggleSpinnerEvent(action: ActionData): void {
        /**
         * Toggling spinner is called during a ngInit (in component)
         * It can cause issues with 'Expression has changed after it was checked'
         * Therefore making the delay is going to 'fire' the event after change detector was already ran
         */
        timer(0)
            .pipe(take(1))
            .subscribe(() => {
                const formSpinnerEvent = new FormSpinnerEvent(action.target, {
                    showSpinner: action.payload?.['showSpinner'],
                    message: action.payload?.['message'],
                });

                this.formService.toggleFormSpinner.next(formSpinnerEvent);
            });
    }
}
