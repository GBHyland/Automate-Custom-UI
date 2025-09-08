/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { CacheLabelService } from '../services/cache-label-service';

@Pipe({
    name: 'breadcrumbLabel',
    standalone: true,
})
export class BreadcrumbLabelPipe implements PipeTransform {
    private readonly cacheLabelService: CacheLabelService = inject(CacheLabelService);

    transform(doc: Document, translationKey: string): string {
        if (!doc) {
            return '';
        }

        return this.cacheLabelService.getTranslation(doc, translationKey);
    }
}
