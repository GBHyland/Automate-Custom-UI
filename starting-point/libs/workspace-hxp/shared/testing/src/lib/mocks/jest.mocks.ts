/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as fileDocument from './jsons/documents/fileDocument.json';
import * as fileVersionDocument from './jsons/documents/fileVersionDocument.json';
import * as folderDocument from './jsons/documents/folderDocument.json';
import * as nestedDocument from './jsons/documents/nestedDocument.json';
import * as nestedDocumentAncestors from './jsons/documents/nestedDocumentAncestors.json';
import * as nestedDocumentAncestors2 from './jsons/documents/nestedDocumentAncestors2.json';
import * as searchResults from './jsons/documents/searchResults.json';
import * as noSearchResults from './jsons/documents/noSearchResults.json';
import * as renditionCompleted from './jsons/documents/renditionCompleted.json';
import * as renditionPending from './jsons/documents/renditionPending.json';
import { acl } from './acl';
import * as users from './jsons/users.json';
import * as modelApi from './jsons/model-api.json';
import * as userList from './jsons/permissions-management/userList.json';
import * as userGroupList from './jsons/permissions-management/userGroupList.json';
import * as permission from './jsons/permissions-management/permission.json';
import * as viewerSupportedDocument from './jsons/documents/viewerSupportedDocument.json';
import * as viewerNotSupportedDocument from './jsons/documents/viewerNotSupportedDocument.json';
import * as versionSupportedDocument from './jsons/documents/versionSupportedDocument.json';

const documentWithAcl = {
    ...fileDocument,
    sys_effectiveAcl: [...acl],
    sys_acl: [...acl],
};

export const jestMocks = {
    fileDocument,
    fileVersionDocument,
    folderDocument,
    nestedDocument,
    nestedDocumentAncestors,
    nestedDocumentAncestors2,
    searchResults,
    renditionCompleted,
    renditionPending,
    documentWithAcl,
    users,
    modelApi,
    userList,
    userGroupList,
    permission,
    viewerSupportedDocument,
    viewerNotSupportedDocument,
    versionSupportedDocument,
    noSearchResults,
};
