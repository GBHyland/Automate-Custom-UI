/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { AxiosProgressEvent } from 'axios';

export interface FileUploadProgress extends AxiosProgressEvent {
    percent?: number;
}

export class FileUploadOptions {
    /**
     * Root folder id.
     */
    parentId?: string;
    /**
     * Defines the **relativePath** value.
     * The relativePath specifies the folder structure to create relative to the node nodeId.
     * Folders in the relativePath that do not exist are created before the node is created.
     */
    path?: string;
    /**
     * The id of the content type to use when upload the file
     */
    contentType?: string = 'SysFile';

    newVersion?: boolean;
}

// eslint-disable-next-line no-shadow
export enum FileUploadStatus {
    Pending = 0,
    Complete = 1,
    Starting = 2,
    Progress = 3,
    Cancelled = 4,
    Aborted = 5,
    Error = 6,
    Deleted = 7,
}

export class FileModel {
    readonly name: string;
    readonly size: number;
    readonly file: File;

    id?: string;
    status: FileUploadStatus = FileUploadStatus.Pending;
    errorCode: number | null;
    progress: FileUploadProgress;
    options: FileUploadOptions;
    data: any;

    constructor(file: File, options?: FileUploadOptions, id?: string) {
        this.file = file;
        this.id = id;
        this.name = file.name;
        this.size = file.size;
        this.data = null;
        this.errorCode = null;

        this.progress = {
            loaded: 0,
            total: 0,
            percent: 0,
            bytes: 0,
            lengthComputable: false,
        };

        this.options = Object.assign(
            {},
            {
                newVersion: false,
            },
            options
        );
    }

    get extension(): string {
        return this.name.slice((Math.max(0, this.name.lastIndexOf('.')) || Number.POSITIVE_INFINITY) + 1);
    }
}
