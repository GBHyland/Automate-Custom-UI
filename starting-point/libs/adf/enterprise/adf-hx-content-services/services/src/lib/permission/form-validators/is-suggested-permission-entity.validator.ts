/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';
import { PermissionEntity } from '../models/permissions-management-row.model';

@Injectable({
    providedIn: 'root',
})
export class IsSuggestedPermissionEntityValidator {
    createValidator(suggestions$: Observable<PermissionEntity[]>): AsyncValidatorFn {
        const distinctSuggestions$ = suggestions$.pipe(distinctUntilChanged(this.isSameArray));
        return ({ value }: AbstractControl<string | PermissionEntity>): Observable<ValidationErrors | null> =>
            distinctSuggestions$.pipe(
                take(1),
                map((suggestions) =>
                    // eslint-disable-next-line unicorn/no-null
                    this.isValid(value, suggestions) ? null : this.error(value)
                ),
                catchError(() => of(this.error(value)))
            );
    }

    private isValid(value: string | PermissionEntity, suggestions: PermissionEntity[]) {
        return this.isPermissionEntity(value) && this.suggestionsIncludePermissionEntity(suggestions, value as PermissionEntity);
    }

    private isPermissionEntity(value: string | PermissionEntity) {
        return typeof value !== 'string';
    }

    private suggestionsIncludePermissionEntity(suggestions: PermissionEntity[], entity: PermissionEntity) {
        return suggestions.some((suggestion) => entity.entityLabel === suggestion.entityLabel);
    }

    private isSameArray(prev: PermissionEntity[], next: PermissionEntity[]) {
        return prev.length === next.length && prev.every(({ entityId }, index) => entityId === next[index].entityId);
    }

    private error(value: string | PermissionEntity) {
        return { suggestedEntity: { value } };
    }
}
