/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { checkInApiProvider } from './providers/checkin-api.provider';
import { copyApiProvider } from './providers/copy-api.provider';
import { documentApiProvider } from './providers/document-api.provider';
import { downloadApiProvider } from './providers/download-api.provider';
import { groupApiProvider } from './providers/group-api.provider';
import { modelApiProvider } from './providers/model-api.provider';
import { moveApiProvider } from './providers/move-api.provider';
import { queryApiProvider } from './providers/query-api.provider';
import { renditionsApiProvider } from './providers/rendition-api.provider';
import { uploadApiProvider } from './providers/upload-api.provider';
import { userApiProvider } from './providers/user-api.provider';
import { versionApiProvider } from './providers/version-api.provider';

export const ADF_HX_CONTENT_SERVICES_API_PROVIDERS = [
    checkInApiProvider,
    copyApiProvider,
    documentApiProvider,
    downloadApiProvider,
    groupApiProvider,
    modelApiProvider,
    moveApiProvider,
    queryApiProvider,
    renditionsApiProvider,
    userApiProvider,
    uploadApiProvider,
    versionApiProvider,
];
