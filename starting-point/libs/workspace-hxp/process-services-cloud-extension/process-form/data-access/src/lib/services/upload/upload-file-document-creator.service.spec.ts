/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT_API_TOKEN, ROOT_DOCUMENT, documentApiProvider, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { UploadSuccessData } from '@hxp/shared-hxp/services';
import { DocumentApi } from '@hylandsoftware/hxcs-js-client';
import { UploadFileDocumentCreatorService } from './upload-file-document-creator.service';

describe('UploadFileDocumentCreatorService', () => {
    let uploadFileDocumentCreatorService: UploadFileDocumentCreatorService;
    let documentApi: DocumentApi;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [mockHxcsJsClientConfigurationService, documentApiProvider, UploadFileDocumentCreatorService],
        });

        uploadFileDocumentCreatorService = TestBed.inject(UploadFileDocumentCreatorService);
        documentApi = TestBed.inject(DOCUMENT_API_TOKEN);
    });

    it('should upload a file', async () => {
        const uploadedFile = {
            fileName: 'testFile',
            id: 'test-some-fake-uuid',
        };
        const uploadFileOptions = { parentId: ROOT_DOCUMENT.sys_id };
        const uploadFile: UploadSuccessData = {
            uploadedFile,
            uploadFileOptions,
        };
        const createDocumentUnderParentByIdSpy = jest.spyOn(documentApi, 'createDocumentUnderParentById').mockReturnValue(
            generateMockResponse({
                ...jestMocks.fileDocument,
                sys_name: uploadedFile.fileName,
                sys_parentId: uploadFileOptions.parentId,
                sys_primaryType: 'SysFile',
                sys_title: uploadedFile.fileName,
                sysfile_blob: {
                    uploadId: uploadedFile.id,
                },
            })
        );

        expect(createDocumentUnderParentByIdSpy).not.toBeCalled();

        await uploadFileDocumentCreatorService.onUploadFile(uploadFile);

        expect(createDocumentUnderParentByIdSpy).toBeCalledTimes(1);
        expect(createDocumentUnderParentByIdSpy).toBeCalledWith(uploadFileOptions.parentId, undefined, {
            sys_title: 'testFile',
            sysfile_blob: { uploadId: 'test-some-fake-uuid' },
            sys_name: 'testFile',
            sys_parentId: '00000000-0000-0000-0000-000000000000',
            sys_primaryType: 'SysFile',
        });
    });
});
