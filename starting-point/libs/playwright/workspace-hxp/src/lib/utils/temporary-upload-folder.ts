/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import assert from 'node:assert/strict';
import { Document as HxDocument } from '@hylandsoftware/hxcs-js-client/typings';
import { FileProperties, HxprApi } from '@alfresco-dbp/playwright/shared/api';

/**
 * Provides a simple way to temporarily upload local files to HxPR.
 *
 * Usage:
 * - Use {@linkcode TemporaryUploadFolder.create()} to create a `SysFolder` and class instance.
 * - Use {@linkcode uploadFile()} or {@linkcode uploadFiles()} to upload local files to the `SysFolder`.
 * - Call the [async dispose method][1] (e.g., via `await using`) to recursively delete the `SysFolder` and its contents.
 *
 * [1]: <https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#using-declarations-and-explicit-resource-management>
 *
 * @example
 * ```typescript
 * await using uploadStore = await TemporaryUploadFolder.create(hxprApi);
 * const [doc1, doc2] = await uploadStore.uploadFiles([file1, file2]);
 * // ... use uploaded files in tests ...
 * ```
 */
export class TemporaryUploadFolder implements AsyncDisposable {
    private static readonly folderDescription = 'temporary files uploaded during an e2e test';

    /**
     * Constructs a new instance by first creating a temporary folder in which to store uploaded files.
     * The returned instance's async dispose method must be called to delete the temporary folder and any uploaded files.
     *
     * @param hxprApi - Used to interact with the API for file uploads and folder management.
     * @param folderParentId - Optional `sys_id` of the parent folder under which to create the temporary folder (created at root level by default).
     * @returns A promise that resolves to a new instance of this class associated with the newly created folder.
     * @throws If `SysFolder` creation fails.
     */
    static async create(hxprApi: HxprApi, folderParentId?: string): Promise<TemporaryUploadFolder> {
        const uploadFolder = await hxprApi.documentServiceApi.createFolder('pw-run', this.folderDescription, folderParentId);
        assertValidDocument(uploadFolder);
        return new TemporaryUploadFolder(hxprApi, uploadFolder.sys_id);
    }

    /**
     * @param hxprApi - Used to interact with the HxPR API for file uploads and folder management.
     * @param folderId - The `sys_id` of the `SysFolder` to manage. Deleted by `[Symbol.asyncDispose]()`.
     */
    private constructor(private readonly hxprApi: HxprApi, private readonly folderId: string) {}

    async [Symbol.asyncDispose](): Promise<void> {
        await this.hxprApi.documentServiceApi.deleteDocumentById(this.folderId); // recursive delete
    }

    /**
     * Uploads a local file as a `SysFile` to the temporary `SysFolder` managed by this class instance.
     *
     * @param localFile - Identifies the file to upload and some HxPR document properties for it.
     * @param documentProperties - Optional properties to set on the document.
     * @returns A promise that resolves to the *successful* result of uploading the file.
     * @throws {AssertionError} If an API call fails.
     */
    async uploadFile(localFile: Readonly<FileProperties>, documentProperties?: Readonly<DocumentProperties>): Promise<HxDocument> {
        const doc = await this.hxprApi.uploadServiceApi.uploadFile(localFile, this.folderId, documentProperties);
        assertValidDocument(doc);
        return doc;
    }

    /**
     * Uploads multiple files concurrently using {@linkcode uploadFile()}.
     *
     * @see {@linkcode uploadFile()} for more details.
     * @throws {AssertionError} If an API call fails.
     */
    uploadFiles(localFiles: ReadonlyArray<Readonly<FileProperties>>): Promise<HxDocument[]> {
        return Promise.all(localFiles.map((file) => this.uploadFile(file)));
    }
}

function assertValidDocument(doc: HxDocument): asserts doc is HxDocument {
    assert.equal(doc === null ? 'null' : typeof doc, 'object', 'Document must be an object');
    assert.equal(doc.status, undefined, 'Document must not have a status property'); // error object
    assert.equal(typeof doc.sys_id, 'string', 'Document must have a sys_id property of type string');
}

type DocumentProperties = Parameters<HxprApi['uploadServiceApi']['uploadFile']>[2];
