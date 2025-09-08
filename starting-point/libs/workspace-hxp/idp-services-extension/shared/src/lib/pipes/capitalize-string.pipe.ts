/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hylandIdpTransformPascalCaseString',
    standalone: true,
})
export class TransformPascalCaseStringPipe implements PipeTransform {
    transform(value: string): string {
        const capWords = value
            .split('_')
            .filter(Boolean)
            .map((element) => this.capitalizeFirstLetter(element));
        return capWords.join(' ').trim();
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) {
            return value;
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
