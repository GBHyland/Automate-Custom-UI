/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { UploadActionStrategy } from './upload-action-strategy';
import { UploadContentModel } from '../model/upload-content.model';

@Injectable({
    providedIn: 'root',
})
export class CreateDocumentStrategy implements UploadActionStrategy {
    constructor(private documentService: DocumentService) {}

    execute(upload: UploadContentModel): Observable<Document> {
        return this.documentService.createDocument(upload.documentModel.document);
    }
}
