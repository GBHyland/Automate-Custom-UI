/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Pipe({
    name: 'hxpDateTimePipe',
    pure: false,
    standalone: true,
})
export class DateTimeFormatPipe implements PipeTransform {
    static readonly DEFAULT_LOCALE = 'en-US';
    static readonly DATE_TIME_FORMAT_24_HR = 'YYYY-MM-d H:mm:ss';
    static readonly DATE_TIME_FORMAT_12_HR = 'MMM d, y h:mm a';

    defaultLocale = DateTimeFormatPipe.DEFAULT_LOCALE;

    constructor(public userPreferenceService: UserPreferencesService) {
        this.userPreferenceService
            .select(UserPreferenceValues.Locale)
            .pipe(takeUntilDestroyed())
            .subscribe((locale) => {
                this.defaultLocale = locale || DateTimeFormatPipe.DEFAULT_LOCALE;
            });
    }

    transform(value: Date, format: string) {
        if (value !== null && value !== undefined) {
            let displayFormat = DateTimeFormatPipe.DATE_TIME_FORMAT_12_HR;
            if (format === '24hr') {
                displayFormat = DateTimeFormatPipe.DATE_TIME_FORMAT_24_HR;
            }
            const datePipe: DatePipe = new DatePipe(this.defaultLocale, displayFormat);
            return datePipe.transform(value, displayFormat);
        }
        return '';
    }
}
