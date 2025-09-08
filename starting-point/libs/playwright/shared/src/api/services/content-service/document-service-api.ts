/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom } from '../../../utils';
import { Configuration, Document, DocumentApi } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { logError } from '../../utils/axios-utils';
import { ROOT_DOCUMENT } from '../../models/root-document';
import { GroupServiceApi } from './group-service-api';
import { UserServiceApi } from './user-service-api';
import { logger } from '../../../utils/node-logger';

export const enum DocumentType {
    File = 'SysFile',
    Folder = 'SysFolder',
}

export const DocumentPermissions = {
    EVERYTHING: 'Everything',
    READ: 'Read',
    READ_WRITE: 'ReadWrite',
} as const;
export type DocumentPermissions = typeof DocumentPermissions[keyof typeof DocumentPermissions];
export class DocumentServiceApi {
    private documents: Document[] = [];
    private readonly documentApi: DocumentApi;
    private readonly groupServiceApi: GroupServiceApi;
    private readonly userServiceApi: UserServiceApi;

    constructor(private readonly configuration: Configuration) {
        this.documentApi = new DocumentApi(this.configuration);
        this.groupServiceApi = new GroupServiceApi(this.configuration);
        this.userServiceApi = new UserServiceApi(this.configuration);
    }

    createDocument(
        documentType: DocumentType,
        title: string,
        description: string,
        parentId: string = ROOT_DOCUMENT.sys_id,
        documentProperties?: Record<string, any>,
        keepOriginalName: boolean = false
    ): Promise<Document> {
        const newDocument: Document = {
            sys_primaryType: documentType,
            sys_title: title,
            sys_description: description,
            ...documentProperties,
        };
        return this.createDocumentUnderParentById(newDocument, parentId, keepOriginalName).catch((error: any) =>
            logError('Error in createDocument()', error)
        );
    }

    createDocumentUnderParentById(document: Document, folderId: string, keepOriginalName: boolean = false) {
        const fileName: string = document.sys_title || 'e2e-test-file';
        const uniqueFileName = keepOriginalName ? fileName : `e2e-${fileName}-${UtilRandom.generateAlphaNumeric(8)}`;

        return this.documentApi
            .createDocumentUnderParentById(folderId, undefined, {
                ...document,
                sys_title: uniqueFileName,
                sys_name: uniqueFileName,
            })
            .then(({ data }: any) => {
                this.documents.push(data);
                logger.info(`Created a ${data.sys_primaryType} document "${data.sys_title}"\n  id: ${data.sys_id}\n  parentId: ${data.sys_parentId}`);
                return data;
            })
            .catch((error: any) => logError('Error in createDocumentUnderParentById()', error));
    }

    createFolder(title: string, description: string, parentId: string = ROOT_DOCUMENT.sys_id): Promise<Document> {
        return this.createDocument(DocumentType.Folder, title, description, parentId);
    }

    async createFolderWithPermissions(
        title: string,
        description: string,
        userName: string,
        permission: DocumentPermissions = DocumentPermissions.READ_WRITE,
        parentId: string = ROOT_DOCUMENT.sys_id,
        keepOriginalName: boolean = false
    ): Promise<Document> {
        const documentProperties = await this.getGroupPermissions(userName, permission);
        return this.createDocument(DocumentType.Folder, title, description, parentId, documentProperties, keepOriginalName);
    }

    createFile(title: string, description: string, parentId: string = ROOT_DOCUMENT.sys_id): Promise<Document> {
        return this.createDocument(DocumentType.File, title, description, parentId);
    }

    async createFilesSequentially(files: Document[], parentId: string = ROOT_DOCUMENT.sys_id): Promise<Document[]> {
        const results: Document[] = [];
        for (const file of files) {
            try {
                const created = await this.createFile(file.sys_title, file.sys_title, parentId);
                results.push(created);
            } catch (error) {
                logError("Failed to create file '${file.sys_title}':", error);

                throw error;
            }
        }
        return results;
    }

    createFiles(files: Document[], parentId: string = ROOT_DOCUMENT.sys_id): Promise<Document[]> {
        const createdFiles: Document[] = [];

        return Promise.all(
            files.map((file) => {
                return this.createFile(file.sys_title, file.sys_description, parentId).then((createdFile) => {
                    createdFiles.push(createdFile);
                });
            })
        )
            .then(() => createdFiles)
            .catch((error: any) => {
                logError('Error in createFiles()', error);
                return [];
            });
    }

    deleteDocumentById(documentId: string): Promise<void> {
        return this.documentApi
            .deleteDocumentById(documentId)
            .then(() => {
                logger.info(`Deleted document with id: ${documentId}`);
                const docIdx = this.documents.findIndex((doc) => doc.sys_id === documentId);
                if (docIdx >= 0) {
                    this.documents.splice(docIdx, 1);
                }
            })
            .catch((error: any) => logError('Error in deleteDocument()', error));
    }

    updateDocument({ sys_id }: Document, updatedProperties: { [key: string]: any }) {
        return this.documentApi
            .updateDocumentById(sys_id, 'default', updatedProperties)
            .then(({ data }: { data: Document }) => {
                const docIdx = this.documents.findIndex((doc) => doc.sys_id === sys_id);
                if (docIdx >= 0) {
                    this.documents[docIdx] = data;
                }
                return data;
            })
            .catch((error: any) => logError('Error in updateDocument()', error));
    }

    getDocumentById(documentId: string) {
        return this.documentApi
            .getDocumentById(documentId)
            .then(({ data }: { data: Document }) => {
                return data;
            })
            .catch((error: any) => logError('Error in getDocumentById()', error));
    }

    updateIndividualPermissionDocument = async (userName: string, uploadDocument: Document, permission: DocumentPermissions) => {
        return this.updateDocument(uploadDocument, await this.getIndividualPermissions(userName, permission));
    };

    getIndividualPermissions = async (userName: string, permission: DocumentPermissions) => {
        const entityDetails = await this.userServiceApi.getUserDetailsByName(userName);
        return {
            sys_acl: [
                {
                    permission,
                    granted: true,
                    user: {
                        id: entityDetails.id,
                        firstName: entityDetails.firstName,
                        lastName: entityDetails.lastName,
                    },
                    status: 'EFFECTIVE',
                },
            ],
        };
    };

    updateGroupPermissionDocument = async (user: string, uploadDocument: Document, permission: DocumentPermissions) => {
        return this.updateDocument(uploadDocument, await this.getGroupPermissions(user, permission));
    };

    getGroupPermissions = async (user: string, permission: DocumentPermissions) => {
        const userId = await this.groupServiceApi.getGroupId(user === 'repoadmin' ? 'Repository Admin' : user);
        const name = user === 'repoadmin' ? 'Repository Admin' : user;
        const label = user === 'repoadmin' ? 'Repository Admin' : user + ' group';
        return {
            sys_acl: [
                {
                    permission,
                    granted: true,
                    group: {
                        id: userId,
                        name,
                        label,
                    },
                    status: 'EFFECTIVE',
                },
            ],
        };
    };

    disableDocumentInheritancePermission = async (uploadDocument: Document) => {
        return this.updateDocument(uploadDocument, {
            sys_acl: [
                {
                    user: '__Everyone__',
                    permission: 'Everything',
                    granted: false,
                },
            ],
        });
    };

    async teardown(): Promise<void> {
        // to prevent concurrent document deletion, delete the documents whose parent is the ROOT
        const documents = this.documents.filter((doc) => doc.sys_parentId === ROOT_DOCUMENT.sys_id);
        await Promise.all(documents.map((doc) => this.deleteDocumentById(doc.sys_id)))
            .catch((error) => logError('Error in teardown()', error))
            .finally(() => (this.documents = []));
    }
}
