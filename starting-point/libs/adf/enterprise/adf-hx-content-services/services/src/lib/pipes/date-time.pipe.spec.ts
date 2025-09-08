/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule, UserPreferencesService } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DateTimeFormatPipe } from '../pipes/date-time-pipe';

describe('DatetimePipe', () => {
    let pipe: DateTimeFormatPipe;
    let userPreferences: UserPreferencesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [DateTimeFormatPipe],
        });
        userPreferences = TestBed.inject(UserPreferencesService);
        jest.spyOn(userPreferences, 'select').mockReturnValue(of(''));
        pipe = TestBed.inject(DateTimeFormatPipe);
    });

    it('should return date time in 12 hour format', () => {
        const dateTime = new Date('2025-03-21T16:09:51.289Z');
        const result = pipe.transform(dateTime, '12hr');
        expect(result).toEqual('Mar 21, 2025 4:09 PM');
    });

    it('should return date time in 12 hour format', () => {
        const dateTime = new Date('2025-03-21T16:09:51.289Z');
        const result = pipe.transform(dateTime, '24hr');
        expect(result).toEqual('2025-03-21 16:09:51');
    });
});
