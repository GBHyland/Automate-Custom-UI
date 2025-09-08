/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileModel, FileUploadStatus } from '../model/file.model';

export class FileUploadEvent {
    constructor(
        public readonly file: FileModel,
        public readonly status: FileUploadStatus = FileUploadStatus.Pending,
        public readonly error: any = null
    ) {}
}

export class FileUploadCompleteEvent extends FileUploadEvent {
    constructor(file: FileModel, public totalComplete: number = 0, public data?: any, public totalAborted: number = 0) {
        super(file, FileUploadStatus.Complete);
    }
}

export class FileUploadDeleteEvent extends FileUploadEvent {
    constructor(file: FileModel, public totalComplete: number = 0) {
        super(file, FileUploadStatus.Deleted);
    }
}

export class FileUploadErrorEvent extends FileUploadEvent {
    constructor(file: FileModel, public override error: any, public totalError: number = 0) {
        super(file, FileUploadStatus.Error);
    }
}
