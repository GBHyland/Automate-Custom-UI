/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NumberFilterOperatorType, NumberFilterValue } from '@alfresco-dbp/shared-filters-services';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatSelectModule } from '@angular/material/select';
import { UnescapePipe } from './unescape.pipe';
import { A11yModule } from '@angular/cdk/a11y';
import { AllowDecimalValuesDirective } from './allow-decimal-values.directive';

const rangeValidator: ValidatorFn = (range: AbstractControl): ValidationErrors | null => {
    const value1 = range.get('value1');
    const value2 = range.get('value2');

    if (value1 === null || value2 === null) {
        return null;
    }

    return value1.value > value2.value ? { invalidRange: true } : null;
};

@Component({
    selector: 'hxp-number-filter-menu',
    standalone: true,
    imports: [
        CommonModule,
        OverlayModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        TranslatePipe,
        MatDividerModule,
        MatButtonModule,
        UnescapePipe,
        A11yModule,
        AllowDecimalValuesDirective,
    ],
    templateUrl: './number-filter-menu.component.html',
    styleUrls: ['./number-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFilterMenuComponent implements OnInit {
    @Input() value: NumberFilterValue | null = null;

    @Input() allowDecimalValues = false;

    @Output() update: EventEmitter<NumberFilterValue> = new EventEmitter<NumberFilterValue>();

    @Input() operators: Map<NumberFilterOperatorType, string> = new Map([]);

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    form = new FormGroup(
        {
            value1: new FormControl<number | null>(null),
            value2: new FormControl<number | null>(null),
            operator: new FormControl<NumberFilterOperatorType>(NumberFilterOperatorType.EQUALS, { nonNullable: true }),
        },
        { validators: rangeValidator }
    );

    get operator(): NumberFilterOperatorType {
        return this.form.controls.operator.value;
    }

    get value1(): number | null {
        const value1 = this.form.controls.value1.value;
        return value1 === undefined ? null : value1;
    }

    get value2(): number | null {
        const value2 = this.form.controls.value2.value;
        return value2 === undefined ? null : value2;
    }

    get clearSelectionButtonDisabled(): boolean {
        return this.value1 === null && this.value2 === null;
    }

    get updateButtonDisabled(): boolean {
        if (this.operator === NumberFilterOperatorType.BETWEEN) {
            return this.value1 === null || this.value2 === null || this.form.invalid;
        }
        return false;
    }

    ngOnInit(): void {
        if (!this.value) {
            return;
        }
        this.form.controls.value1.setValue(this.value.value1);
        this.form.controls.value2.setValue(this.value.value2);
        this.form.controls.operator.setValue(this.value.operator || NumberFilterOperatorType.EQUALS);

        this.form.valueChanges.subscribe((changes) => {
            if (changes.operator !== NumberFilterOperatorType.BETWEEN) {
                this.form.controls.value2.setValue(null, { emitEvent: false });
            }
        });
    }

    onClearSelection(): void {
        this.form.reset();
    }

    onUpdate(): void {
        if (this.operator !== NumberFilterOperatorType.EQUALS && this.value1 === null) {
            this.form.controls.operator.setValue(NumberFilterOperatorType.EQUALS);
        }
        this.update.emit({
            value1: this.value1,
            operator: this.operator || NumberFilterOperatorType.EQUALS,
            value2: this.value2,
        });
    }

    trackByType(index: number, operator: NumberFilterOperatorType) {
        return operator;
    }
}
