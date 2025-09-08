/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { isFolder } from '@alfresco/adf-hx-content-services/services';

@Pipe({
    standalone: true,
    name: 'isFolderishDocument',
})
export class IsFolderishDocumentPipe implements PipeTransform {
    transform(document: Document): boolean {
        return isFolder(document);
    }
}
