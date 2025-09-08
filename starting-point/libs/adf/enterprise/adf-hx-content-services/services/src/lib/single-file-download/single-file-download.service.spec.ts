/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SingleFileDownloadService } from './single-file-download.service';
import { downloadApiProvider, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { of } from 'rxjs';
import { BlobDownloadService } from '../blob-download/blob-download.service';

describe('SingleFileDownloadService', () => {
    let singleFileDownloadService: SingleFileDownloadService;
    let blobDownloadService: BlobDownloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [mockHxcsJsClientConfigurationService, downloadApiProvider, BlobDownloadService],
        });
        singleFileDownloadService = TestBed.inject(SingleFileDownloadService);
        blobDownloadService = TestBed.inject(BlobDownloadService);
    });

    it('should download a blob', () => {
        const downloadBlobSpy = spyOn(blobDownloadService, 'downloadBlob').and.returnValue(of(new Blob()));
        singleFileDownloadService.download(jestMocks.fileDocument);
        expect(downloadBlobSpy).toHaveBeenCalled();
    });
});
