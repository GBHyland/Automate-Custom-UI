/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FormFieldModel, FormModel } from '@alfresco/adf-core';
import { FormWidgetsFieldValidator } from './form-widgets-field-validator';

describe('FormWidgetsFieldValidator', () => {
    let validator: FormWidgetsFieldValidator;
    let form: FormModel;
    let field: FormFieldModel;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        validator = new FormWidgetsFieldValidator();

        form = new FormModel();
        field = new FormFieldModel(form, {
            type: 'hxp-upload',
            id: 'hxp-upload-fake-id',
        });
    });

    it('should support hxpUpload type and visible field', () => {
        field.type = 'hxp-upload';
        field.isVisible = true;
        expect(validator.isSupported(field)).toBeTrue();
    });

    it('should support hxp-properties-viewer type and visible field', () => {
        field.type = 'hxp-properties-viewer';
        field.isVisible = true;
        expect(validator.isSupported(field)).toBeTrue();
    });

    it('should not support other types', () => {
        field.type = 'text';
        field.isVisible = true;
        expect(validator.isSupported(field)).toBeFalse();
    });

    it('should validation pass for required field with value', () => {
        field.required = true;
        field.value = 'some value';
        expect(validator.validate(field)).toBeTrue();
    });

    it('should validation fail for required field without value', () => {
        field.required = true;
        field.value = null;
        expect(validator.validate(field)).toBeFalse();
    });

    it('should validation non-required field', () => {
        field.required = false;
        expect(validator.validate(field)).toBeTrue();
    });

    it('should validation pass for required field with non-empty array value', () => {
        field.required = true;
        field.value = ['some value'];
        expect(validator.validate(field)).toBeTrue();
    });

    it('should validation fail for required field with empty array value', () => {
        field.required = true;
        field.value = [];
        expect(validator.validate(field)).toBeFalse();
    });
});
