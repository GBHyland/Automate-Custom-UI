/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isAfter, isBefore, isValid, parse } from 'date-fns';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CreatedDateFormType } from './created-date-search-filter.type';
import { CreatedDateSearchFilterService } from './created-date-search-filter.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CreatedDateSearchFilterData } from './created-date-search-filter.data';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FilterId, SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseSearchFilterDirective } from '../../directives/base-search-filter.directive';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface CreatedDateOption {
    label: string;
    date: string;
}

@Component({
    selector: 'hxp-search-created-date-filter',
    templateUrl: './created-date-search-filter.component.html',
    styleUrls: ['./created-date-search-filter.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDividerModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        ReactiveFormsModule,
        SearchFilterContainerComponent,
        TranslatePipe,
    ],
    providers: [CreatedDateSearchFilterService],
})
export class CreatedDateSearchFiltersComponent extends BaseSearchFilterDirective<CreatedDateFormType> implements OnInit {
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('afterDateInput') protected afterDateInput?: ElementRef;
    @ViewChild('beforeDateInput') protected beforeDateInput?: ElementRef;
    @ViewChild(MatSelectionList) selectionList?: MatSelectionList;

    public defaultCreatedDateOptions: CreatedDateOption[] = [
        {
            label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.LAST_7_DAYS',
            date: 'LAST_7_DAYS',
        },
        {
            label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.LAST_30_DAYS',
            date: 'LAST_30_DAYS',
        },
        {
            label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.LAST_6_MONTHS',
            date: 'LAST_6_MONTHS',
        },
        {
            label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.LAST_YEAR',
            date: 'LAST_YEAR',
        },
    ];

    protected beforeDateInputSubject = new Subject<void>();
    protected afterDateInputSubject = new Subject<void>();

    constructor(
        protected datePipe: DatePipe,
        protected override searchFilterValueService: SearchFilterValueService,
        protected createdDateSearchFilterService: CreatedDateSearchFilterService,
        private translate: TranslateService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        super(searchFilterValueService);

        const icons: Record<string, string> = {
            search_calendar: 'assets/search-icons/Calendar_search.svg',
        };

        for (const [iconName, iconPath] of Object.entries(icons)) {
            this.matIconRegistry.addSvgIcon(iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath));
        }
    }

    public get id(): FilterId {
        return 'CreatedDateSearchFiltersComponent';
    }

    ngOnInit() {
        this.beforeDateInputSubject.pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterForm.get('beforeDate')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        this.afterDateInputSubject.pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterForm.get('afterDate')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });
    }

    public toHXQL(data: CreatedDateSearchFilterData): string {
        return this.createdDateSearchFilterService.toHXQL(data);
    }

    afterDateFilter = (d: Date | null): boolean => {
        const beforeDate = this.filterForm.value.beforeDate;
        return !beforeDate || !d || isBefore(d, beforeDate);
    };

    beforeDateFilter = (d: Date | null): boolean => {
        const afterDate = this.filterForm.value.afterDate;
        return !afterDate || !d || isAfter(d, afterDate);
    };

    protected setData(data: CreatedDateSearchFilterData): void {
        try {
            for (const value of data?.values || []) {
                const beforeDate = value.beforeDate ? new Date(value.beforeDate) : null;
                const afterDate = value.afterDate ? new Date(value.afterDate) : null;
                if (afterDate || beforeDate) {
                    this.filterForm.patchValue({
                        isCustomDate: true,
                        afterDate,
                        beforeDate,
                    });
                    this.updateCustomDateSelectedValue();
                } else if (value['date']) {
                    this.createdDateValueChanged(value as CreatedDateOption);
                }
            }
        } catch (error) {
            console.error('Error while setting data for Created Date filter', error);
        }
    }

    protected getFormControls(): { [key: string]: AbstractControl } {
        return {
            defaultOption: new FormControl(null),
            isCustomDate: new FormControl(false),
            afterDate: new FormControl(null, [this.dateFormatValidator('afterDateInput'), this.afterDateValidator()]),
            beforeDate: new FormControl(null, [this.dateFormatValidator('beforeDateInput'), this.beforeDateValidator()]),
        };
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

    protected createdDateValueChanged(data: CreatedDateOption): void {
        this.selectedValue = new CreatedDateSearchFilterData([data]);
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
        const inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    private updateCustomDateSelectedValue(): void {
        let label = '';

        const { afterDate, beforeDate } = this.filterForm.value;

        if (afterDate && beforeDate) {
            label = this.translate.instant('SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_DATE', {
                afterDate: this.datePipe.transform(afterDate, 'mediumDate'),
                beforeDate: this.datePipe.transform(beforeDate, 'mediumDate'),
            });
        } else if (afterDate && !beforeDate) {
            label = this.translate.instant('SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_TODAY', {
                date: this.datePipe.transform(afterDate, 'mediumDate'),
            });
        } else if (!afterDate && beforeDate) {
            label = this.translate.instant('SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.UNTIL_DATE', {
                date: this.datePipe.transform(beforeDate, 'mediumDate'),
            });
        }

        this.selectedValue = label
            ? new CreatedDateSearchFilterData([
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
