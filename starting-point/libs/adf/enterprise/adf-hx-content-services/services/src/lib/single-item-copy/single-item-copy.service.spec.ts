/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { SingleItemCopyService } from './single-item-copy.service';
import { CopyApi } from '@hylandsoftware/hxcs-js-client';
import { COPY_API_TOKEN, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { CopyStatus } from './models/copy-status.enum';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../adf-enterprise-adf-hx-content-services-services.providers';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('SingleItemCopyService', () => {
    let singleItemCopyService: SingleItemCopyService;
    let copyApi: CopyApi;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [provideAdfEnterpriseAdfHxContentServicesServices(), mockHxcsJsClientConfigurationService],
        });
        singleItemCopyService = TestBed.inject(SingleItemCopyService);
        copyApi = TestBed.inject(COPY_API_TOKEN);
    });

    it('should call copy and return SUCCESS when copy file id, name and target folder are present', (done) => {
        const copyFileId = jestMocks.fileDocument.sys_id;
        const name = 'COPY.FILE_NAME_BEGINS' + jestMocks.fileDocument.sys_name;
        const targetParentId = jestMocks.folderDocument.sys_id;
        const copySpy = jest.spyOn(copyApi, 'copy').mockReturnValue(
            Promise.resolve({
                document: jestMocks.fileDocument,
                status: CopyStatus.SUCCESS,
            })
        );
        expect(copySpy).toHaveBeenCalledTimes(0);
        singleItemCopyService.copy(copyFileId, name, targetParentId).subscribe((response) => {
            expect(copySpy).toHaveBeenCalledTimes(1);
            expect(copySpy).toHaveBeenCalledWith(copyFileId, 'default', {
                name,
                targetParentId,
            });
            expect(response.status).toEqual(CopyStatus.SUCCESS);
            done();
        });
    });

    it('should call copy and return ERROR when copy file id and name are present but target folder is missing', (done) => {
        const copyFileId = jestMocks.fileDocument.sys_id;
        const name = 'COPY.FILE_NAME_BEGINS' + jestMocks.fileDocument.sys_name;
        const targetParentId = '';
        const copySpy = jest.spyOn(copyApi, 'copy').mockReturnValue(Promise.reject());
        expect(copySpy).toHaveBeenCalledTimes(0);
        singleItemCopyService.copy(copyFileId, name, targetParentId).subscribe((response) => {
            expect(copySpy).toHaveBeenCalledTimes(1);
            expect(response.status).toEqual(CopyStatus.ERROR);
            done();
        });
    });

    it('should call copy and return ERROR when target folder is present but copy file id and name are missing', (done) => {
        const copyFileId = '';
        const name = '';
        const targetParentId = jestMocks.folderDocument.sys_id;
        const copySpy = jest.spyOn(copyApi, 'copy').mockReturnValue(Promise.reject());
        expect(copySpy).toHaveBeenCalledTimes(0);
        singleItemCopyService.copy(copyFileId, name, targetParentId).subscribe((response) => {
            expect(copySpy).toHaveBeenCalledTimes(1);
            expect(response.status).toEqual(CopyStatus.ERROR);
            done();
        });
    });

    it('should call copy and return ERROR when target folder and copy file id are present but copy file name is missing', (done) => {
        const copyFileId = jestMocks.fileDocument.sys_id;
        const name = '';
        const targetParentId = jestMocks.folderDocument.sys_id;
        const copySpy = jest.spyOn(copyApi, 'copy').mockReturnValue(Promise.reject());
        expect(copySpy).toHaveBeenCalledTimes(0);
        singleItemCopyService.copy(copyFileId, name, targetParentId).subscribe((response) => {
            expect(copySpy).toHaveBeenCalledTimes(1);
            expect(response.status).toEqual(CopyStatus.ERROR);
            done();
        });
    });

    it('should call copy and return ERROR when target folder and copy file name are present but copy file id is missing', (done) => {
        const copyFileId = '';
        const name = 'COPY.FILE_NAME_BEGINS' + jestMocks.fileDocument.sys_name;
        const targetParentId = jestMocks.folderDocument.sys_id;
        const copySpy = jest.spyOn(copyApi, 'copy').mockReturnValue(Promise.reject());
        expect(copySpy).toHaveBeenCalledTimes(0);
        singleItemCopyService.copy(copyFileId, name, targetParentId).subscribe((response) => {
            expect(copySpy).toHaveBeenCalledTimes(1);
            expect(response.status).toEqual(CopyStatus.ERROR);
            done();
        });
    });
});
