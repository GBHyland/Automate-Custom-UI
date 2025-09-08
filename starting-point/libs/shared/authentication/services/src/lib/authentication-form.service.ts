/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AuthenticationCredentialsField } from './models/authentication-details-form-values.types';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
    basicAuthenticationFormFields,
    bearerAuthenticationFormFields,
    clientCredentialsAuthenticationFormFields,
    grantTypeAuthenticationFormFields,
    smtpAuthenticationFormFields,
} from './models/authentication-details-form-fields.model';
import { AuthenticationType } from './models/authentication.types';
import { AuthenticationContent } from './models/authentication-content.model';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationFormService {
    constructor(private fb: UntypedFormBuilder) {}

    createFormGroupForAuthentication(
        authenticationFormFieldsDefinition: AuthenticationCredentialsField[],
        authContent: AuthenticationContent
    ): UntypedFormGroup {
        let formControls = {};
        for (const formField of authenticationFormFieldsDefinition) {
            const formControl = Object.assign({});
            const formControlValue = authContent?.hasAuthProperties() ? authContent.getAuthProperty(formField.key) : '';
            formControl[formField.key] = this.createAuthController(formControlValue, formField.required, formField.pattern);
            formControls = { ...formControls, ...formControl };
        }
        const formGroup = {};
        formGroup[authContent.getAuthKey()] = this.fb.group(formControls);
        return this.fb.group(formGroup);
    }

    private createAuthController(value: string, required: boolean = true, pattern?: RegExp): UntypedFormControl {
        const controller = new UntypedFormControl(value);
        if (required) {
            controller.setValidators([Validators.required, Validators.pattern(pattern)]);
        } else {
            controller.setValidators([Validators.pattern(pattern)]);
        }
        return controller;
    }

    getAuthenticationFormFieldsDefinitionByType(authType: AuthenticationType): AuthenticationCredentialsField[] {
        switch (authType) {
            case AuthenticationType.BASIC: {
                return basicAuthenticationFormFields;
            }
            case AuthenticationType.BEARER: {
                return bearerAuthenticationFormFields;
            }
            case AuthenticationType.CLIENT_CREDENTIALS: {
                return clientCredentialsAuthenticationFormFields;
            }
            case AuthenticationType.GRANT_TYPE: {
                return grantTypeAuthenticationFormFields;
            }
            case AuthenticationType.SMTP: {
                return smtpAuthenticationFormFields;
            }
            default: {
                return basicAuthenticationFormFields;
            }
        }
    }
}
