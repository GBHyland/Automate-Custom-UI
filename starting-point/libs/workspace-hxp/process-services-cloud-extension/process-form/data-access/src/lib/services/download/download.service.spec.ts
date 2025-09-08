/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { DownloadService } from './download.service';
import { DOCUMENT_DOWNLOAD_DATA_MOCK, DOCUMENT_MOCK } from '../../mocks/document.mock';
import { MockProvider, MockService } from 'ng-mocks';
import { DocumentApi } from '@hylandsoftware/hxcs-js-client';
import { DOCUMENT_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { BlobDownloadService } from '@alfresco/adf-hx-content-services/services';
import { of } from 'rxjs';

const mockDocumentApi: DocumentApi = MockService(DocumentApi);

describe('DownloadService', () => {
    let downloadService: DownloadService;
    let downloadByIdApiSpy: jest.SpyInstance<Promise<any>>;
    let downloadByPathApiSpy: jest.SpyInstance<Promise<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                { provide: DOCUMENT_API_TOKEN, useValue: mockDocumentApi },
                MockProvider(BlobDownloadService, {
                    downloadBlob: () =>
                        of(
                            new Blob([''], {
                                type: DOCUMENT_MOCK.sysfile_blob.mimeType,
                            })
                        ),
                }),
                DownloadService,
            ],
        });

        downloadByIdApiSpy = jest.spyOn(mockDocumentApi, 'getDocumentById').mockReturnValue(
            Promise.resolve({
                data: DOCUMENT_MOCK,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            } as any)
        );

        downloadByPathApiSpy = jest.spyOn(mockDocumentApi, 'getDocumentByPath').mockReturnValue(
            Promise.resolve({
                data: DOCUMENT_MOCK,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            } as any)
        );

        downloadService = TestBed.inject(DownloadService);
    });

    it('should get file by id', (done) => {
        downloadService.downloadByDocumentId(DOCUMENT_MOCK.sys_id).subscribe((fileData) => {
            expect(downloadByIdApiSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_id);
            expect(fileData).toEqual(DOCUMENT_DOWNLOAD_DATA_MOCK);
            done();
        });
    });

    it('should get file by path', (done) => {
        downloadService.downloadByDocumentPath(DOCUMENT_MOCK.sys_path).subscribe((fileData) => {
            expect(downloadByPathApiSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_path);
            expect(fileData).toEqual(DOCUMENT_DOWNLOAD_DATA_MOCK);
            done();
        });
    });
});
