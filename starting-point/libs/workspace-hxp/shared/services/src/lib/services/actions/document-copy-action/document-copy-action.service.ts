/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { DocumentPathChangeNotifierService } from '../models/document-path-change-notifier.service';

@Injectable({
    providedIn: 'root',
})
export class DocumentCopyActionService extends DocumentPathChangeNotifierService {
    constructor(private documentService: DocumentService, private translateService: TranslateService) {
        super();
    }

    copy(copyDocument: Document, targetFolder: Document): Observable<Document | undefined> {
        const origin = copyDocument.sys_parentId;
        return this.documentService
            .copyDocument(
                copyDocument.sys_id || '',
                `${this.translateService.instant('COPY.DIALOG.FILE_NAME_PREFIX')} ${copyDocument.sys_name}`,
                targetFolder.sys_id || ''
            )
            .pipe(
                take(1),
                switchMap((response) => {
                    return response.document
                        ? this.documentService.updateDocument(response.document?.sys_id || '', {
                              sys_title: `${this.translateService.instant('COPY.DIALOG.FILE_NAME_PREFIX')} ${copyDocument.sys_title}`,
                          })
                        : of(undefined);
                }),
                tap((document) => {
                    if (origin && document?.sys_parentId) {
                        this.emitDocumentPathChange({ origin, target: document.sys_parentId });
                    }
                })
            );
    }
}
