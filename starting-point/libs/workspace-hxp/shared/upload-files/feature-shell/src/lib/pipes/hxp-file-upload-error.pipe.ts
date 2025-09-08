/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '@alfresco/adf-core';

@Pipe({
    name: 'hxpFileUploadError',
    standalone: true,
    pure: true,
})
export class HxpFileUploadErrorPipe implements PipeTransform {
    constructor(private translation: TranslationService) {}

    transform(errorCode: number): string {
        return this.translation.instant(`FILE_UPLOAD.ERRORS.${errorCode || 'GENERIC'}`);
    }
}
