/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { UploadActionStrategy, UploadContentModel } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

@Injectable({
    providedIn: 'root',
})
export class UpdateDocumentBlobActionStrategy implements UploadActionStrategy {
    constructor(private documentService: DocumentService) {}

    execute(upload: UploadContentModel): Observable<Document> {
        return this.documentService.updateDocument(upload.documentModel.document.sys_id, {
            sysfile_blob: {
                uploadId: upload.documentModel.document.sysfile_blob.uploadId,
            },
        });
    }
}
