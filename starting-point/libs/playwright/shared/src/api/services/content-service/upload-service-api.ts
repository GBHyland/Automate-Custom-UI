/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Configuration, UploadApi, Document } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { readFileSync } from 'node:fs';
import { DocumentServiceApi } from './document-service-api';
import { ROOT_DOCUMENT } from '../../models/root-document';
import { FileProperties } from '../../models/file-properties';

export class UploadServiceApi {
    private uploadApi: UploadApi;
    private documentServiceApi: DocumentServiceApi;

    constructor(private configuration: Configuration) {
        this.uploadApi = new UploadApi(this.configuration);
        this.documentServiceApi = new DocumentServiceApi(this.configuration);
    }

    async uploadFile(file: FileProperties, parentId: string = ROOT_DOCUMENT.sys_id, documentProperties?: Record<string, any>): Promise<Document> {
        const body = readFileSync(file.path);

        const uploadedFile = await this.uploadApi.upload(undefined, undefined, undefined, undefined, file.title, undefined, file.mimeType, body, {
            headers: {
                'Content-Type': file.mimeType,
            },
        });

        const uploadId = uploadedFile.data.id;
        const documentWithBlob = {
            sys_title: file.title,
            sys_primaryType: 'SysFile',
            sysfile_blob: {
                uploadId,
            },
            ...documentProperties,
        };
        return this.documentServiceApi.createDocumentUnderParentById(documentWithBlob, parentId);
    }
}
