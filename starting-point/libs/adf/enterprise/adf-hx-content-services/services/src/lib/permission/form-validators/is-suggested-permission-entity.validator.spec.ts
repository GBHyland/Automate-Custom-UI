/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { IsSuggestedPermissionEntityValidator } from './is-suggested-permission-entity.validator';
import { PermissionEntity } from '../models/permissions-management-row.model';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

describe('IsSuggestedPermissionEntityValidator', () => {
    const getValidatorPromise = <T>(validatorFn: AsyncValidatorFn, value: T) => {
        return firstValueFrom(validatorFn({ value } as AbstractControl<T>) as Observable<ValidationErrors | null>);
    };

    it('should validate selected entity against suggestion list', async () => {
        const entity: PermissionEntity = {
            entityId: '',
            entityType: 'user',
            entityLabel: 'hr hruser',
            entity: {
                id: '',
                firstName: 'hr',
                lastName: 'hruser',
                email: '',
            },
        };
        const suggestionsSubject = new BehaviorSubject<PermissionEntity[]>([]);
        const validator = new IsSuggestedPermissionEntityValidator();
        const validatorFn = validator.createValidator(suggestionsSubject.asObservable());
        suggestionsSubject.next([entity]);

        expect(await getValidatorPromise(validatorFn, 'text')).toEqual({ suggestedEntity: { value: 'text' } });
        expect(await getValidatorPromise(validatorFn, entity)).toBeNull();
        expect(await getValidatorPromise(validatorFn, { ...entity, entityLabel: 'non existent' })).not.toBeNull();
    });
});
