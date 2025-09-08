/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { of, BehaviorSubject, firstValueFrom } from 'rxjs';
import { IdpSharedImageLoadingService } from './idp-shared-image-loading.service';
import { IdpBackendService } from '../backend/idp-backend.service';
import { IdpDocumentPage, IdpImageInfo } from '../../models/common-models';
import { DestroyRef } from '@angular/core';

class MockIdpBackendService implements Partial<IdpBackendService> {
    getFileMetadata$ = jest.fn().mockReturnValue(of(undefined));
    getFilePageImageBlob$ = jest.fn().mockReturnValue(of(undefined));
}

describe('IdpSharedImageLoadingService', () => {
    let service: IdpSharedImageLoadingService;
    let idpBackendService: IdpBackendService;
    const mockBlobUrl = 'blobUrl';
    const mockPage: IdpDocumentPage = {
        id: 'page1',
        name: 'Page 1',
        documentId: 'doc1',
        fileReference: 'fileRef1',
        sourcePageIndex: 0,
        rotation: 0,
        viewerRotation: 0,
    };
    const mockFileMetadata = {
        pages: [
            {
                pageIndex: 0,
                imageWidth: 100,
                imageHeight: 100,
                rotation: 0,
                skew: 0,
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: IdpSharedImageLoadingService,
                    useFactory: () => {
                        const localService = new IdpSharedImageLoadingService(TestBed.inject(IdpBackendService), TestBed.inject(DestroyRef));
                        (localService as any).cache$ = new BehaviorSubject({});
                        return localService;
                    },
                },
                { provide: IdpBackendService, useClass: MockIdpBackendService },
                { provide: DestroyRef, useValue: { onDestroy: (fn: () => void) => fn() } },
            ],
        });

        service = TestBed.inject(IdpSharedImageLoadingService);
        idpBackendService = TestBed.inject(IdpBackendService);

        global.URL.createObjectURL = jest.fn(() => mockBlobUrl);
        global.URL.revokeObjectURL = jest.fn();
    });

    it('should return cached image data if available', async () => {
        const imageData: IdpImageInfo = {
            blobUrl: 'blobUrl',
            width: 100,
            height: 100,
            viewerRotation: 0,
            correctionAngle: 0,
            skew: 0,
        };

        const spy = spyOn(idpBackendService, 'getFileMetadata$');

        (service as any).cache$.next({ [mockPage.id]: imageData });

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data).toEqual({ ...imageData, viewerRotation: mockPage.viewerRotation });
        expect(spy).not.toHaveBeenCalled();
    });

    it('should fetch image data if not cached', async () => {
        const blobUrl = mockBlobUrl;
        const metadataApiSpy = spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(mockFileMetadata));
        const imageApiSpy = spyOn(idpBackendService, 'getFilePageImageBlob$').and.returnValue(of(blobUrl));

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data).toEqual({
            blobUrl: mockBlobUrl,
            width: 100,
            height: 100,
            viewerRotation: 0,
            correctionAngle: 0,
            skew: 0,
        });
        expect(metadataApiSpy).toHaveBeenCalledWith('correlationId', mockPage.fileReference);
        expect(imageApiSpy).toHaveBeenCalledWith('correlationId', mockPage.fileReference, 0);
    });

    it.each([
        // [pageRotation, viewerRotation, metadataRotation, expectedViewerRotation, expectedCorrectionAngle]
        [270, 0, 90, 0, 270],
        [0, 90, 90, 90, 270],
        [90, 180, 90, 180, 270],
        [180, 270, 90, 270, 270],

        [180, 0, 180, 0, 180],
        [270, 90, 180, 90, 180],
        [0, 180, 180, 180, 180],
        [90, 270, 180, 270, 180],

        [90, 0, 270, 0, 90],
        [180, 90, 270, 90, 90],
        [270, 180, 270, 180, 90],
        [0, 270, 270, 270, 90],

        [0, 0, 0, 0, 0],
        [90, 90, 0, 90, 0],
        [180, 180, 0, 180, 0],
        [270, 270, 0, 270, 0],
    ])(
        'should fetch image data with pageRotation=%i, viewerRotation=%i, metadataRotation=%i',
        async (pageRotation, viewerRotation, metadataRotation, expectedViewerRotation, expectedCorrectionAngle) => {
            const blobUrl = mockBlobUrl;
            const mockFileMetadataLocal = {
                pages: [
                    {
                        pageIndex: 0,
                        imageWidth: 100,
                        imageHeight: 100,
                        rotation: metadataRotation,
                        skew: 0,
                    },
                ],
            };
            const mockPageLocal: IdpDocumentPage = {
                id: 'page1',
                name: 'Page 1',
                documentId: 'doc1',
                fileReference: 'fileRef1',
                sourcePageIndex: 0,
                rotation: pageRotation,
                viewerRotation: viewerRotation,
            };
            const metadataApiSpy = spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(mockFileMetadataLocal));
            const imageApiSpy = spyOn(idpBackendService, 'getFilePageImageBlob$').and.returnValue(of(blobUrl));

            const data = await firstValueFrom(service.getImageDataForPage$(mockPageLocal, 'correlationId'));
            expect(data).toEqual({
                blobUrl: mockBlobUrl,
                width: 100,
                height: 100,
                viewerRotation: expectedViewerRotation,
                correctionAngle: expectedCorrectionAngle,
                skew: 0,
            });
            expect(metadataApiSpy).toHaveBeenCalledWith('correlationId', mockPageLocal.fileReference);
            expect(imageApiSpy).toHaveBeenCalledWith('correlationId', mockPageLocal.fileReference, 0);
        }
    );

    it('should return cached thumbnail image data if available', async () => {
        const imageData: IdpImageInfo = {
            blobUrl: 'blobUrl',
            width: 100,
            height: 100,
            viewerRotation: 0,
        };

        const spy = spyOn(idpBackendService, 'getFileMetadata$');

        (service as any).cache$.next({ [`${mockPage.id}_thumbnail`]: imageData });

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId', true));
        expect(data).toEqual({ ...imageData, viewerRotation: mockPage.viewerRotation });
        expect(spy).not.toHaveBeenCalled();
    });

    it('should fetch thumbnail image data if not cached', async () => {
        const blobUrl = mockBlobUrl;
        const imageApiSpy = spyOn(idpBackendService, 'getFilePageImageBlob$').and.returnValue(of(blobUrl));

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId', true));
        expect(data).toEqual({
            blobUrl: mockBlobUrl,
            width: 100,
            height: 100,
        });
        expect(imageApiSpy).toHaveBeenCalledWith('correlationId', mockPage.fileReference, 0, true);
    });

    it('should handle undefined metadata response', async () => {
        spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(undefined));

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data).toBeUndefined();
    });

    it('should handle undefined blob response', async () => {
        spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(mockFileMetadata));
        spyOn(idpBackendService, 'getFilePageImageBlob$').and.returnValue(of(undefined));

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data).toBeUndefined();
    });

    it('should not cache invalid image data', async () => {
        (service as any).cache$.next({ '': { blobUrl: 'test', width: 100, height: 100 } });

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data?.blobUrl).not.toBe('test');
    });

    it('should use metadataCache if metadata is already cached', async () => {
        (service as any).metadataCache.set(mockPage.fileReference, mockFileMetadata);

        const blobUrl = mockBlobUrl;
        const imageApiSpy = spyOn(idpBackendService, 'getFilePageImageBlob$').and.returnValue(of(blobUrl));
        const metadataApiSpy = spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(mockFileMetadata));

        const data = await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));
        expect(data).toEqual({
            blobUrl: mockBlobUrl,
            width: 100,
            height: 100,
            viewerRotation: 0,
            correctionAngle: 0,
            skew: 0,
        });
        expect(imageApiSpy).toHaveBeenCalledWith('correlationId', mockPage.fileReference, 0);
        expect(metadataApiSpy).not.toHaveBeenCalled();
    });

    it('should cache metadata when fetched', async () => {
        const metadataApiSpy = spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(mockFileMetadata));

        await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));

        expect(metadataApiSpy).toHaveBeenCalledWith('correlationId', mockPage.fileReference);
        expect((service as any).metadataCache.get(mockPage.fileReference)).toEqual(mockFileMetadata);
    });

    it('should not cache undefined metadata', async () => {
        spyOn(idpBackendService, 'getFileMetadata$').and.returnValue(of(undefined));

        await firstValueFrom(service.getImageDataForPage$(mockPage, 'correlationId'));

        expect((service as any).metadataCache.has(mockPage.fileReference)).toBe(false);
    });

    it('should clear metadataCache on clearCache', () => {
        (service as any).metadataCache.set(mockPage.fileReference, mockFileMetadata);

        service.cleanup();

        expect((service as any).metadataCache.size).toBe(0);
    });
});
