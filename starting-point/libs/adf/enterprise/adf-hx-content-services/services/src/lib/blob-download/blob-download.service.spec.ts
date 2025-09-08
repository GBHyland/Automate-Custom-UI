/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { BlobDownloadService } from './blob-download.service';
import { DownloadApi } from '@hylandsoftware/hxcs-js-client';
import { jestMocks, generateMockResponse } from '@hxp/workspace-hxp/shared/testing';
import { downloadApiProvider, DOWNLOAD_API_TOKEN, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

describe('BlobDownloadService', () => {
    let service: BlobDownloadService;
    let downloadApi: DownloadApi;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClientTesting(), mockHxcsJsClientConfigurationService, downloadApiProvider, BlobDownloadService],
        });
        service = TestBed.inject(BlobDownloadService);
        downloadApi = TestBed.inject(DOWNLOAD_API_TOKEN);
    });

    it('should download the blob', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const mockBlob = new Blob();
        jest.spyOn(downloadApi, 'downloadByIdAndXPath').mockReturnValue(generateMockResponse({ data: mockBlob }));

        expect(downloadApi.downloadByIdAndXPath).not.toHaveBeenCalled();

        const blob = await firstValueFrom(service.downloadBlob(documentId));

        expect(blob).toBe(mockBlob);
        expect(downloadApi.downloadByIdAndXPath).toHaveBeenCalledWith(documentId, 'sysfile_blob', false, 'default', { responseType: 'blob' });
    });
});
