/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
    NewPermissionEntity,
    PermissionEntity,
    NewPermission,
    IsSuggestedPermissionEntityValidator,
    InheritedPermissionEntity,
    Permission,
} from '@alfresco/adf-hx-content-services/services';
import { NgIf, NgFor, NgClass, KeyValuePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NewPermissionLabels } from '../models/permissions-label.model';

interface AddPermissionForm {
    search: FormControl<string>;
    permission: FormControl<NewPermission | undefined>;
}

@Component({
    selector: 'hxp-add-permission',
    templateUrl: './add-permission.component.html',
    styleUrls: ['./add-permission.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatIconModule,
        NgIf,
        MatOptionModule,
        MatProgressSpinnerModule,
        NgFor,
        NgClass,
        MatSelectModule,
        MatButtonModule,
        KeyValuePipe,
        TranslatePipe,
    ],
})
export class AddPermissionComponent implements OnChanges {
    private destroyRef = inject(DestroyRef);

    @Input() suggestions: Array<InheritedPermissionEntity> = [];

    @Input() addButtonLabel = '';

    @Input() searchPlaceholderText = '';

    @Input() loading = false;

    @Output() addNewPermission: EventEmitter<NewPermissionEntity> = new EventEmitter();

    @Output() search: EventEmitter<string> = new EventEmitter();

    form: FormGroup<AddPermissionForm>;

    selectedSuggestion?: InheritedPermissionEntity;
    protected permissionLabels = NewPermissionLabels;

    private readonly suggestionsSubject = new BehaviorSubject<PermissionEntity[]>([]);

    constructor(private isSuggestedPermissionEntityValidator: IsSuggestedPermissionEntityValidator) {
        this.form = new FormGroup<AddPermissionForm>(
            {
                search: new FormControl<string>('', {
                    validators: Validators.required,
                    asyncValidators: this.isSuggestedPermissionEntityValidator.createValidator(this.suggestionsSubject.asObservable()),
                    nonNullable: true,
                }),
                permission: new FormControl<NewPermission | undefined>(
                    { value: undefined, disabled: true },
                    {
                        validators: Validators.required,
                        nonNullable: true,
                    }
                ),
            },
            { validators: this.getDisableValidator.bind(this) }
        );
        this.form.controls.search.valueChanges
            .pipe(
                filter((text) => typeof text === 'string'),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (text) => {
                    this.search.emit(text.trim());
                },
            });
        this.destroyRef.onDestroy(() => {
            this.suggestionsSubject.complete();
        });
    }

    ngOnChanges(): void {
        this.suggestionsSubject.next(this.suggestions);
    }

    addPermission() {
        if (this.selectedSuggestion) {
            const { inheritedPermission, ...suggestedEntity } = this.selectedSuggestion;
            const newPermission: NewPermissionEntity = {
                ...suggestedEntity,
                permission: this.form.controls.permission.value as NewPermission,
            };
            this.form.controls.search.patchValue('');
            this.form.controls.permission.patchValue(undefined);
            this.selectedSuggestion = undefined;
            this.form.controls.permission.disable();
            this.addNewPermission.emit(newPermission);
        }
    }

    selectSuggestion(event: MatAutocompleteSelectedEvent) {
        this.selectedSuggestion = event.option.value;
        if (this.selectedSuggestion) {
            this.permissionLabels = this.getAvailablePermissionsOptions(this.selectedSuggestion.inheritedPermission);
            this.form.controls.permission.enable();
        }
    }

    getEntityLabel(entity: PermissionEntity) {
        return entity?.entityLabel ?? '';
    }

    originalOrder = (): number => 0;

    protected suggestionTrackBy(_index: number, suggestion: PermissionEntity) {
        return suggestion.entityId;
    }

    private getAvailablePermissionsOptions(permission?: NewPermission) {
        if (!permission) {
            return NewPermissionLabels;
        }
        const levels: Permission[] = ['None', 'Read', 'ReadWrite', 'Everything'];
        const currentLevel = levels.indexOf(permission);
        const availableOptions: any = {};
        for (const [key, value] of Object.entries(NewPermissionLabels)) {
            const level = levels.indexOf(key as Permission);
            if (level > currentLevel) {
                availableOptions[key] = value;
            }
        }
        return availableOptions;
    }

    private getDisableValidator(): { [key: string]: any } | null {
        if (this.form?.controls?.permission?.disabled) {
            return { isStillDisabled: true };
        }
        // eslint-disable-next-line unicorn/no-null
        return null;
    }
}
