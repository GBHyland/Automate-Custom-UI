/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { documentApiProvider } from '@alfresco/adf-hx-content-services/api';
import { DownloadService } from './services/download/download.service';

export { DownloadService, DownloadData } from './services/download/download.service';
export { UploadFileDocumentCreatorService } from './services/upload/upload-file-document-creator.service';

@NgModule({
    providers: [documentApiProvider, DownloadService],
})
export class ProcessServicesCloudExtensionProcessFormDataAccessModule {}
