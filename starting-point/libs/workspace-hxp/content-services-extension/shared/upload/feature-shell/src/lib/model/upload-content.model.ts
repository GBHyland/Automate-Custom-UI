/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileModel } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { UploadDocumentModel } from './upload-document.model';
import { UploadActionStrategy } from '../document-update-strategies/upload-action-strategy';

export interface UploadContentModel {
    fileModel: FileModel;
    documentModel: UploadDocumentModel;
    postFileUploadAction?: UploadActionStrategy;
}
