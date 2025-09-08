/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '@alfresco/adf-core';
import { IdpBackendService } from './idp-backend.service';
import { IdpFileMetadata, IdpFilePageOcrData } from '../../models/api-models/idp-api-recognition-models';
import { DOWNLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ResponseFormat } from '../../models/common-models';

describe('IdpBackendService', () => {
    const mockBackendBaseUrl = 'https://localhost';
    const mockAppConfigService = {
        get: jasmine.createSpy('get').and.returnValue(mockBackendBaseUrl),
    };

    const mockDownloadApi = {
        downloadUrlByIdAndXPath: jest.fn().mockResolvedValue('pre-signed-url'),
    };

    let service: IdpBackendService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                IdpBackendService,
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: DOWNLOAD_API_TOKEN, useValue: mockDownloadApi },
            ],
        });

        service = TestBed.inject(IdpBackendService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get file metadata', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const jobResponse: IdpFileMetadata = { status: 'Succeeded', pageCount: 10, pages: [] };

        let result;
        service.getFileMetadata$(correlationId, fileReference).subscribe((response) => {
            result = response;
        });

        const pollReq1 = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/metadata?correlationId=${correlationId}&fileReference=${fileReference}`
        );
        expect(pollReq1.request.method).toBe('GET');
        pollReq1.flush(jobResponse);

        tick(1000);
        expect(result).toEqual(jobResponse);
    }));

    it('should handle error when getting file metadata', fakeAsync(() => {
        let result;
        service.getFileMetadata$('123', 'fileRef').subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(`${mockBackendBaseUrl}/api/recognition/file/metadata?correlationId=123&fileReference=fileRef`);
        expect(req.request.method).toBe('GET');
        req.flush('Error', { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should get file page image blob url', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const mockBlobUrl = 'https://example.com/image.png';

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=false&imageAsUrl=true`
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('json');
        expect(req.request.headers.get('Accept')).toBe('application/json');
        req.flush({ url: mockBlobUrl });

        tick(1000);
        expect(result).toEqual(mockBlobUrl);
    }));

    it('should handle error when getting file page image blob url', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=false&imageAsUrl=true`
        );
        expect(req.request.method).toBe('GET');
        // eslint-disable-next-line unicorn/no-null
        req.flush(null, { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should get file page thumbnail image blob url', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const thumbnail = true;
        const mockBlobUrl = 'https://example.com/image.png';

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex, true).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}` +
                `&fileReference=${fileReference}&pageIndex=${pageIndex}` +
                `&thumbnail=${thumbnail}&imageAsUrl=true`
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('json');
        expect(req.request.headers.get('Accept')).toBe('application/json');
        req.flush({ url: mockBlobUrl });

        tick(1000);
        expect(result).toEqual(mockBlobUrl);
    }));

    it('should handle error when getting file page thumbnail image blob url ', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const thumbnail = true;

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex, true).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}` +
                `&fileReference=${fileReference}&pageIndex=${pageIndex}` +
                `&thumbnail=${thumbnail}&imageAsUrl=true`
        );
        expect(req.request.method).toBe('GET');
        // eslint-disable-next-line unicorn/no-null
        req.flush(null, { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should request the ocr of a document', fakeAsync(() => {
        const correlationId = '987';
        const fileReference = '789';
        const pageIndex = 0;
        const jobResponse: IdpFilePageOcrData = {
            status: 'Succeeded',
            fileReference: fileReference,
            words: [
                {
                    text: 'Line One',
                    confidence: 90,
                    boundingBox: { top: 10, left: 10, width: 100, height: 20 },
                },
                {
                    text: 'Line Two',
                    confidence: 90,
                    boundingBox: { top: 40, left: 10, width: 100, height: 20 },
                },
            ],
            layout: '',
        };

        let result;
        service.ocrDocumentPage$(correlationId, fileReference, pageIndex, ResponseFormat.Ocr).subscribe((response) => {
            result = response;
        });

        flush();

        const req = httpMock.expectOne(`${mockBackendBaseUrl}/api/recognition/file`);
        expect(req.request.method).toBe('POST');
        req.flush('', { status: 200, statusText: 'OK' });
        tick(1000);
        const recRespReq = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page/ocr?correlationId=${correlationId}&fileReference=${fileReference}` +
                `&pageIndex=${pageIndex}&responseFormat=${ResponseFormat.Ocr.toString()}`
        );
        recRespReq.flush(jobResponse);

        tick(1000);
        expect(result).toEqual(jobResponse);
    }));

    it('should post docs for ocr if initial get returns 404', fakeAsync(() => {
        const correlationId = '987';
        const fileReference = '789';
        const pageIndex = 0;
        const errorBody = 'Not Found';
        const jobResponse: IdpFilePageOcrData = {
            status: 'Succeeded',
            fileReference: fileReference,
            words: [
                {
                    text: 'Line One',
                    confidence: 90,
                    boundingBox: { top: 10, left: 10, width: 100, height: 20 },
                },
                {
                    text: 'Line Two',
                    confidence: 90,
                    boundingBox: { top: 40, left: 10, width: 100, height: 20 },
                },
            ],
            layout: '',
        };

        spyOn(service, 'ocrDocumentPage$').and.returnValue(of(jobResponse));

        let result;
        service.getPageOcr$(correlationId, fileReference, pageIndex, ResponseFormat.Ocr).subscribe((response) => {
            result = response;
        });
        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page/ocr?correlationId=${correlationId}&fileReference=${fileReference}` +
                `&pageIndex=${pageIndex}&responseFormat=${ResponseFormat.Ocr.toString()}`
        );
        req.flush(errorBody, { status: 404, statusText: 'Not Found' });

        flush();

        expect(service.ocrDocumentPage$).toHaveBeenCalledWith(correlationId, fileReference, pageIndex, ResponseFormat.Ocr.toString());
        expect(result).toEqual(jobResponse);
    }));

    it('should build URL properly when replacement placeholders are used', () => {
        const correlationId = '123';
        const fileReference = '456';
        mockAppConfigService.get.and.returnValue('https://api.hxidp-<SERVICE_PLACEHOLDER>.hyland.com');

        service.getFileMetadata$(correlationId, fileReference).subscribe(() => {});

        const pollReq1 = httpMock.expectOne(
            `https://api.hxidp-recognition.hyland.com/api/recognition/file/metadata?correlationId=${correlationId}&fileReference=${fileReference}`
        );
        expect(pollReq1.request.method).toBe('GET');
    });

    it('should update rotation data', fakeAsync(() => {
        const correlationId = '123';
        const fileReferences = ['file1', 'file2'];
        const pages = [
            { contentFileReferenceIndex: 0, pageIndex: 0, rotation: 90 },
            { contentFileReferenceIndex: 1, pageIndex: 1, rotation: 180 },
        ];
        const expectedResponse = { success: true };

        service.updateRotationData$(correlationId, fileReferences, pages).subscribe((response) => {
            expect(response).toEqual(expectedResponse);
        });

        const req = httpMock.expectOne(`https://api.hxidp-recognition.hyland.com/api/recognition/files`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({
            correlationId,
            contentFileReferences: [
                { fileReference: 'file1', sourceUrl: '' },
                { fileReference: 'file2', sourceUrl: '' },
            ],
            pages,
        });
        req.flush(expectedResponse);

        flush();
    }));

    it('should handle error when updating rotation data', fakeAsync(() => {
        const correlationId = '123';
        const fileReferences = ['file1'];
        const pages = [{ contentFileReferenceIndex: 0, pageIndex: 0, rotation: 90 }];

        service.updateRotationData$(correlationId, fileReferences, pages).subscribe({
            next: () => fail('Should have errored'),
            error: (error) => {
                expect(error.status).toBe(500);
            },
        });

        const req = httpMock.expectOne(`https://api.hxidp-recognition.hyland.com/api/recognition/files`);
        expect(req.request.method).toBe('PUT');
        req.flush({}, { status: 500, statusText: 'Server Error' });

        flush();
    }));
});
