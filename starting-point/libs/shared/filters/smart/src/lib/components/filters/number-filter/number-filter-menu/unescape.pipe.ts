/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'unescape',
    standalone: true,
})
export class UnescapePipe implements PipeTransform {
    transform(value: string): string {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        return doc.documentElement.textContent || '';
    }
}
