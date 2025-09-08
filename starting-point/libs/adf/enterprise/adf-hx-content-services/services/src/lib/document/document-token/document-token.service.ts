/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, InjectionToken } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';

export const DOCUMENT_SERVICE = new InjectionToken<SharedDocumentService>('DOCUMENT_SERVICE');

@Injectable()
export abstract class SharedDocumentService {
    abstract getDocumentById(documentId: string): Observable<Document>;
    abstract getDocumentByPath(path: string): Observable<Document>;
    abstract updateDocument(documentId: string, updatedFileReq: { [key: string]: any } | undefined): Observable<Document>;
}
