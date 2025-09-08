/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import fileDocument from './lib/mocks/jsons/documents/fileDocument.json';
import folderDocument from './lib/mocks/jsons/documents/folderDocument.json';
import nestedDocument from './lib/mocks/jsons/documents/nestedDocument.json';
import nestedDocumentAncestors from './lib/mocks/jsons/documents/nestedDocumentAncestors.json';
import nestedDocumentAncestors2 from './lib/mocks/jsons/documents/nestedDocumentAncestors2.json';
import searchResults from './lib/mocks/jsons/documents/searchResults.json';
import noSearchResults from './lib/mocks/jsons/documents/noSearchResults.json';
import viewerSupportedDocument from './lib/mocks/jsons/documents/viewerSupportedDocument.json';
import viewerNotSupportedDocument from './lib/mocks/jsons/documents/viewerNotSupportedDocument.json';
import renditionCompleted from './lib/mocks/jsons/documents/renditionCompleted.json';
import renditionPending from './lib/mocks/jsons/documents/renditionPending.json';
import versionSupportedDocument from './lib/mocks/jsons/documents/versionSupportedDocument.json';

import users from './lib/mocks/jsons/users.json';
import modelApi from './lib/mocks/jsons/model-api.json';

import userList from './lib/mocks/jsons/permissions-management/userList.json';
import userGroupList from './lib/mocks/jsons/permissions-management/userGroupList.json';
import permission from './lib/mocks/jsons/permissions-management/permission.json';
import { acl } from './lib/mocks/acl';

export const mocks = {
    users,
    modelApi,
    fileDocument,
    folderDocument,
    nestedDocument,
    nestedDocumentAncestors,
    nestedDocumentAncestors2,
    searchResults,
    noSearchResults,
    viewerSupportedDocument,
    viewerNotSupportedDocument,
    versionSupportedDocument,
    renditionCompleted,
    renditionPending,
    userList,
    userGroupList,
    permission,
    documentWithAcl: {
        ...fileDocument,
        sys_effectiveAcl: [...acl],
        sys_acl: [...acl],
    },
};

export * from './lib/mocks/jest.mocks';
export * from './lib/testing.utils.spec';
export * from './lib/a11y.utils';
