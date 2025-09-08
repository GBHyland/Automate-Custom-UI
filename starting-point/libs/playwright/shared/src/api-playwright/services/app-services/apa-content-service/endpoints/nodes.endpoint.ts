/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import { CustomAPIRequest, Options, NodeData } from '../../../..';
import { UtilFile } from '../../../../../';

export class NodesEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/alfresco/versions/1/nodes`;
    }

    async createFolder(parentFolderId: string | '-my-', folderName: string): Promise<NodeData | RequestResponse> {
        const requestOptions: Options = {
            data: {
                nodeType: 'cm:folder',
                name: folderName,
                properties: {
                    'cm:description': 'Folder created by Playwright',
                    'cm:title': folderName,
                },
            },
        };

        return this.post(`${this.endpoint}/${parentFolderId}/children`, requestOptions);
    }

    async uploadFile(parentFolderId: string, fileLocation: string, fileName: string): Promise<NodeData | RequestResponse> {
        const fileContent = await UtilFile.getStreamFromFile(fileLocation);

        const requestOptions: Options = {
            multipart: {
                name: fileName,
                filedata: fileContent,
                nodeType: 'cm:content',
                renditions: 'doclib',
            },
            params: {
                autoRename: true,
                include: 'allowableOperations',
            },
        };

        return this.post(`${this.endpoint}/${parentFolderId}/children`, requestOptions);
    }

    async deleteNode(nodeId: string): Promise<RequestResponse> {
        return this.delete(`${this.endpoint}/${nodeId}`);
    }

    async createEmptyFile(parentFolderId: string, fileName: string): Promise<NodeData | RequestResponse> {
        const requestOptions: Options = {
            data: {
                nodeType: 'cm:content',
                name: fileName,
                properties: {
                    'cm:description': 'File created by Playwright',
                    'cm:title': fileName,
                },
            },
        };

        return this.post(`${this.endpoint}/${parentFolderId}/children`, requestOptions);
    }

    async createEmptyFiles(parentFolderId: string, fileNames: string[]): Promise<NodeData[] | RequestResponse> {
        const files = [];
        for (const fileName of fileNames) {
            const { entry: file } = await this.createEmptyFile(parentFolderId, fileName);
            files.push(file);
        }

        return files;
    }

    async getDocumentLibraryId(siteGuid: string): Promise<string> {
        const requestOptions: Options = {
            params: {
                relativePath: '/documentLibrary',
            },
        };
        const documentLibrary = await this.get(`${this.endpoint}/${siteGuid}`, requestOptions);

        return documentLibrary.entry.id;
    }
}
