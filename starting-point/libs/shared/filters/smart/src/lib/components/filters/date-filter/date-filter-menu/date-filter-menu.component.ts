/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { DateFilterValue, Option, RANGE_DATE_OPTION } from '@alfresco-dbp/shared-filters-services';
import { MatRadioModule } from '@angular/material/radio';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { endOfDay, startOfDay } from 'date-fns';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-date-filter-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatRadioModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatDatetimepickerModule,
        MatNativeDateModule,
        TranslatePipe,
        A11yModule,
    ],
    templateUrl: './date-filter-menu.component.html',
    styleUrls: ['./date-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFilterMenuComponent implements OnInit {
    @Input() options: Option[] = [];
    @Input() value: DateFilterValue | null = null;
    @Input() useTime = false;

    @Output() update: EventEmitter<DateFilterValue | null> = new EventEmitter<DateFilterValue | null>();

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    customRangeOptionPresent = false;
    customRangeFormVisible = false;

    form = new FormGroup({
        selectedOption: new FormControl<Option | null>(null),
        range: new FormGroup({
            from: new FormControl<Date | null>(null),
            to: new FormControl<Date | null>(null),
        }),
    });

    get clearSelectionButtonDisabled(): boolean {
        return !this.form.value?.selectedOption;
    }

    get updateButtonDisabled(): boolean {
        if (this.form.value?.selectedOption?.value === RANGE_DATE_OPTION.value) {
            return !this.form.value.range?.from && !this.form.value.range?.to;
        }

        return false;
    }

    ngOnInit(): void {
        this.initialize();
    }

    onOptionSelected(option: Option | null): void {
        this.customRangeFormVisible = false;
        this.form.setValue({
            selectedOption: option,
            range: { from: null, to: null },
        });
    }

    onCustomRangeClick(): void {
        this.form.setValue({
            selectedOption: RANGE_DATE_OPTION,
            range: { from: null, to: null },
        });
        this.customRangeFormVisible = true;
    }

    onClearSelection(): void {
        this.onOptionSelected(null);
    }

    onUpdate(): void {
        const formValue = this.form.value;

        if (!formValue.selectedOption) {
            this.update.emit(null);
        } else if (formValue.selectedOption.value === RANGE_DATE_OPTION.value) {
            let from: Date | null;
            let to: Date | null;

            if (this.useTime) {
                from = formValue.range?.from ?? null;
                to = formValue.range?.to ?? null;
            } else {
                from = formValue.range?.from ? startOfDay(formValue.range.from) : null;

                to = formValue.range?.to ? endOfDay(formValue.range.to) : null;
            }

            this.update.emit({
                selectedOption: formValue.selectedOption,
                range: {
                    from,
                    to,
                },
            });
        } else {
            this.update.emit({
                selectedOption: formValue.selectedOption,
                range: null,
            });
        }

        this.form.reset();
    }

    trackByValue(index: number, option: Option) {
        return option.value;
    }

    private initialize(): void {
        this.removeCustomRangeOption();

        this.customRangeFormVisible = this.value?.selectedOption?.value === RANGE_DATE_OPTION.value;
        this.form.setValue({
            selectedOption: this.value?.selectedOption || null,
            range: {
                from: this.value?.range?.from || null,
                to: this.value?.range?.to || null,
            },
        });
    }

    private removeCustomRangeOption(): void {
        this.customRangeOptionPresent = this.options.some((o) => o.value === RANGE_DATE_OPTION.value);
        if (this.customRangeOptionPresent) {
            this.options = this.options.filter((o) => o.label !== RANGE_DATE_OPTION.label);
        }
    }
}
