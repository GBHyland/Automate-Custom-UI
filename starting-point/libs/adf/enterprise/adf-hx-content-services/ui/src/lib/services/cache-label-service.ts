/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { TranslationService } from '@alfresco/adf-core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { isRoot } from '@alfresco/adf-hx-content-services/services';

@Injectable({
    providedIn: 'root',
})
export class CacheLabelService {
    private cache = new Map<string, string>();
    private readonly translationService: TranslationService = inject(TranslationService);

    getCache(): Map<string, string> {
        return this.cache;
    }

    getTranslation(doc: Document, rootTranslationKey: string): string {
        const key = doc.sys_id ?? this.generateUniqueKey(doc);

        if (this.cache.has(key)) {
            return this.cache.get(key) as string;
        }

        const translatedValue = this.getLabel(doc, rootTranslationKey);
        this.cache.set(key, translatedValue);

        return translatedValue;
    }

    private getLabel(doc: Document, rootTranslationKey: string): string {
        return isRoot(doc) ? this.translationService.instant(rootTranslationKey) : doc?.sys_title;
    }

    private generateUniqueKey(doc: Record<string, Document>): string {
        const sortedEntries = Object.entries(doc).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

        const keyString = sortedEntries
            .map(([key, value]) => {
                return `${key}=${value ?? ''}`;
            })
            .join('|');

        return keyString;
    }
}
