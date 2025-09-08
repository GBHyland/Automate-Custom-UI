/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, ElementRef, Input, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { BaseSearchFilterDirective } from '../base-search-filter.directive';
import { debounceTime, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isAfter, isBefore, isValid, parse } from 'date-fns';
import { DateSearchFilterData } from './date-search-filter.data';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectionList } from '@angular/material/list';

export interface DateOption {
    label: string;
    date: string;
}

@Directive()
export abstract class DateSearchFilterBase extends BaseSearchFilterDirective implements OnInit {
    @Input() filterLabelKey = '';
    @ViewChild(MatSelectionList) selectionList?: MatSelectionList;

    public defaultDateOptions: DateOption[] = [
        {
            label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.TOMORROW',
            date: 'TOMORROW',
        },
        {
            label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.NEXT_WEEK',
            date: 'NEXT_WEEK',
        },
        {
            label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.NEXT_MONTH',
            date: 'NEXT_MONTH',
        },
        {
            label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.NEXT_YEAR',
            date: 'NEXT_YEAR',
        },
    ];

    @ViewChild('afterDateInput') protected afterDateInput?: ElementRef;
    @ViewChild('beforeDateInput') protected beforeDateInput?: ElementRef;
    protected beforeDateInputSubject = new Subject<void>();
    protected afterDateInputSubject = new Subject<void>();
    protected datePipe = inject(DatePipe);

    private translate = inject(TranslateService);

    readonly destroyRef: DestroyRef = inject(DestroyRef);

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.beforeDateInputSubject.pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterForm.get('beforeDate')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        this.afterDateInputSubject.pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterForm.get('afterDate')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });
    }

    protected override getFormControls(): { [key: string]: AbstractControl } {
        return {
            defaultOption: new FormControl(null),
            isCustomDate: new FormControl(false),
            afterDate: new FormControl(null, [this.dateFormatValidator('afterDateInput'), this.afterDateValidator()]),
            beforeDate: new FormControl(null, [this.dateFormatValidator('beforeDateInput'), this.beforeDateValidator()]),
        };
    }

    override clearFilter(): void {
        super.clearFilter();
        this.searchFilterContainer.clearChanges();
    }

    protected dateFormatValidator(dateInputTypeLocator: string): ValidatorFn {
        return (): { [key: string]: any } | null => {
            const value = this[dateInputTypeLocator]?.nativeElement.value || '';
            const parsedDate = parse(value, 'MM/dd/yyyy', new Date());

            if (value && !isValid(parsedDate)) {
                return { invalidDateFormat: true };
            }

            return null;
        };
    }

    protected afterDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const afterDate = control.value;
            const beforeDate = this.filterForm?.get('beforeDate')?.value;

            if (isAfter(afterDate, beforeDate)) {
                return { afterDateTooLate: true };
            }

            return null;
        };
    }

    protected beforeDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const beforeDate = control.value;
            const afterDate = this.filterForm?.get('afterDate')?.value;

            if (isBefore(beforeDate, afterDate)) {
                return { beforeDateTooEarly: true };
            }

            return null;
        };
    }

    protected enableCustomDate(e: Event) {
        e.preventDefault();
        this.selectionList?.deselectAll();
        this.selectedValue = this.value;
        this.filterForm.patchValue({
            defaultOption: null,
            isCustomDate: true,
        });
    }

    protected dateValueChanged(data: DateOption): void {
        this.selectedValue = new DateSearchFilterData([data]);
        this.filterForm.patchValue({
            defaultOption: this.selectedValue,
            isCustomDate: false,
            afterDate: null,
            beforeDate: null,
        });
    }

    protected afterDateChanged(event: MatDatepickerInputEvent<Date>): void {
        this.filterForm.patchValue({
            afterDate: event.value,
        });
        this.updateCustomDateSelectedValue();
    }

    protected beforeDateChanged(event: MatDatepickerInputEvent<Date>): void {
        this.filterForm.patchValue({
            beforeDate: event.value,
        });
        this.updateCustomDateSelectedValue();
    }

    protected clearAfterDate(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.afterDateInput) {
            this.afterDateInput.nativeElement.value = '';
            this.filterForm.patchValue({
                afterDate: null,
            });
            this.updateCustomDateSelectedValue();
        }
    }

    protected clearBeforeDate(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.beforeDateInput) {
            this.beforeDateInput.nativeElement.value = '';
            this.filterForm.patchValue({
                beforeDate: null,
            });
            this.updateCustomDateSelectedValue();
        }
    }

    protected validateInput(event: KeyboardEvent) {
        const pattern = /[0-9+\-/]/;
        const inputChar = String.fromCodePoint(event.charCode);

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    private updateCustomDateSelectedValue(): void {
        let label = '';

        const { afterDate, beforeDate } = this.filterForm.value;

        if (afterDate && beforeDate) {
            label = this.translate.instant('GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_DATE', {
                afterDate: this.datePipe.transform(afterDate, 'mediumDate'),
                beforeDate: this.datePipe.transform(beforeDate, 'mediumDate'),
            });
        } else if (afterDate && !beforeDate) {
            label = this.translate.instant('GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_TODAY', {
                date: this.datePipe.transform(afterDate, 'mediumDate'),
            });
        } else if (!afterDate && beforeDate) {
            label = this.translate.instant('GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.UNTIL_DATE', {
                date: this.datePipe.transform(beforeDate, 'mediumDate'),
            });
        }

        this.selectedValue = label
            ? new DateSearchFilterData([
                  {
                      label,
                      afterDate,
                      beforeDate,
                  },
              ])
            : this.value;
    }

    override discardPendingChanges(): void {
        super.discardPendingChanges();
        this.selectionList?.deselectAll();
    }

    override clearChanges(): void {
        super.clearChanges();
        this.selectionList?.deselectAll();
    }
}
