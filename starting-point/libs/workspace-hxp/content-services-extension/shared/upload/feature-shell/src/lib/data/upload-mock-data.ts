/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileModel } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { UploadDocumentModelStatus } from '../model/upload-document.model';

export const generateMockUploadData = (size: number = 2, primaryType: string = 'SysFile') => {
    const mockUploadData = [];
    for (let i = 0; i < size; i++) {
        mockUploadData.push({
            fileModel: new FileModel({ name: 'bigFile.png', size: 1_000_000 } as File),
            documentModel: {
                status: UploadDocumentModelStatus.PENDING,
                document: {
                    sys_primaryType: primaryType,
                    sys_title: `Document ${i}`,
                    sysfile_blob: {
                        uploadId: '',
                    },
                },
            },
        });
    }
    return mockUploadData;
};
