/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ActionContext,
    DocumentActionService,
    DocumentPermissions,
    FileDownloadService,
    hasPermission,
    IsSingleDocumentWithMainBlobService,
} from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';

@Injectable()
export class SingleItemDownloadButtonActionService extends DocumentActionService {
    constructor(private fileDownloadService: FileDownloadService, private isSingleDocumentWithMainBlobService: IsSingleDocumentWithMainBlobService) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return (
            context?.documents &&
            this.isSingleDocumentWithMainBlobService.validate(context.documents) &&
            hasPermission(context.documents?.[0], DocumentPermissions.READ)
        );
    }

    execute(context: ActionContext): void {
        if (context?.documents[0]) {
            this.fileDownloadService.downloadFile(context?.documents);
        }
    }
}
