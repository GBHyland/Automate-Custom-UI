/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentApi, Document } from '@hylandsoftware/hxcs-js-client';
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { SharedUploadMiddlewareService, UploadSuccessData } from '@hxp/shared-hxp/services';

@Injectable({
    providedIn: 'root',
})
export class UploadFileDocumentCreatorService extends SharedUploadMiddlewareService {
    constructor(@Inject(DOCUMENT_API_TOKEN) private documentApi: DocumentApi) {
        super();
    }

    async onUploadFile(uploadFile: UploadSuccessData): Promise<Document> {
        const { uploadedFile, uploadFileOptions } = uploadFile;

        const createDocumentRequestResponse = await this.documentApi.createDocumentUnderParentById(uploadFileOptions.parentId ?? '', undefined, {
            sys_name: uploadedFile.fileName,
            sys_parentId: uploadFileOptions.parentId,
            sys_primaryType: 'SysFile',
            sys_title: uploadedFile.fileName,
            sysfile_blob: {
                uploadId: uploadedFile.id,
            },
        });

        return createDocumentRequestResponse.data;
    }
}
