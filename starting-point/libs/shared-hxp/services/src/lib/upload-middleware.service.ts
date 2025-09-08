/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileUploadOptions } from '@alfresco/adf-content-services';
import { Document, Upload } from '@hylandsoftware/hxcs-js-client';
import { Injectable } from '@angular/core';

export interface UploadSuccessData<T = any> {
    uploadedFile: Upload;
    uploadFileOptions: FileUploadOptions;
    middlewareResults?: T;
}

@Injectable()
export abstract class SharedUploadMiddlewareService {
    abstract onUploadFile(uploadFile: UploadSuccessData | null): Promise<Document | null>;
}
