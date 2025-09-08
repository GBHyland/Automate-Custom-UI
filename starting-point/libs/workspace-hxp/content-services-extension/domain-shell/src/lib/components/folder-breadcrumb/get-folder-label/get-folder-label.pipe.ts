/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { isRoot } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'getFolderLabel',
    standalone: true,
})
export class GetFolderLabelPipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}

    transform(document: Document): string {
        return isRoot(document) ? this.translateService.instant('MOVE.DIALOG.ROOT_FOLDER_NAME') : document.sys_title || document.sys_name || '';
    }
}
