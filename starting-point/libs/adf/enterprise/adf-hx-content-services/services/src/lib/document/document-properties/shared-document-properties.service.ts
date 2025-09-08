/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Observable } from 'rxjs';
import { CardViewItem } from '@alfresco/adf-core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { Injectable, InjectionToken } from '@angular/core';

export const DOCUMENT_PROPERTIES_SERVICE = new InjectionToken<SharedDocumentPropertiesService>('DOCUMENT_PROPERTIES_SERVICE');

@Injectable()
export abstract class SharedDocumentPropertiesService {
    abstract getPropertiesFromDocument(document?: Document | null, options?: any): Observable<CardViewItem[]>;
    abstract getDefaultPropertiesFromDocument(document?: Document | null): Observable<CardViewItem[]>;
    abstract propertyType(property: string): FieldType | undefined;
    abstract getRequiredProperties(): string[];
    abstract extractCustomSchemaFields(documentId: string): Observable<Record<string, any>>;
}
