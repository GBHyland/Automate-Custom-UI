/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'recordDispositionLabel',
    standalone: true,
})
export class RecordDispositionLabelPipe implements PipeTransform {
    transform(disposition: string | null | undefined): string {
        if (!disposition) {
            return 'Purge';
        }

        try {
            const parsed = JSON.parse(disposition);
            return parsed.action || 'Purge';
        } catch {
            return 'Purge';
        }
    }
}
