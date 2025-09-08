/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_LABEL_MAP } from '../../filters/status/status-options.data';

const STATUS_LABEL_MAP_LOWER = Object.fromEntries(Object.entries(STATUS_LABEL_MAP).map(([key, value]) => [key.toLowerCase(), value]));

@Pipe({
    name: 'recordStatusLabel',
    standalone: true,
})
export class RecordStatusLabelPipe implements PipeTransform {
    transform(status: string): string {
        return status ? STATUS_LABEL_MAP_LOWER[status.toLowerCase()] || '' : '';
    }
}
