/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { subDays, subHours, subMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const DateUtils = {
    parseRelativeDate: (input: string): Date | null => {
        if (input.includes('a minute')) {
            return subMinutes(new Date(), 1);
        }
        if (input.includes('an hour')) {
            return subHours(new Date(), 1);
        }
        if (input.includes('a day')) {
            return subDays(new Date(), 1);
        }

        const match = input.match(/(\d+)/);
        if (!match) {
            return null;
        }
        const number = Number.parseInt(match[0], 10);

        if (input.includes('minute')) {
            return subMinutes(new Date(), number);
        }
        if (input.includes('hour')) {
            return subHours(new Date(), number);
        }
        if (input.includes('day')) {
            return subDays(new Date(), number);
        }
        return null;
    },

    findDatesOutOfRange: (datesArray: (Date | null)[], afterDate: Date, beforeDate: Date) => {
        const start = startOfDay(afterDate);
        const end = endOfDay(beforeDate);

        return datesArray.filter((date) => {
            if (!date) {
                return true;
            }
            return !isWithinInterval(date, { start, end });
        });
    },
};
