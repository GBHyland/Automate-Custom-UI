/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'idpJoin',
    standalone: true,
})
export class IdpJoinPipe implements PipeTransform {
    transform(values: any[], joinChar: string = ' '): string {
        if (!Array.isArray(values)) {
            throw new TypeError('IdpJoinPipe: Input is not an array.');
        }
        return values.filter(Boolean).join(joinChar);
    }
}
