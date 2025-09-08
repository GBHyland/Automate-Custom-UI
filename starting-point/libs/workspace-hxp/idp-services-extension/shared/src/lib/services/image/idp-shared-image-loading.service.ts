/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable, OnDestroy } from '@angular/core';
import { catchError, finalize, Observable, of, scan, shareReplay, startWith, Subject, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IdpDocumentPage, IdpImageInfo } from '../../models/common-models';
import { IdpBackendService } from '../backend/idp-backend.service';
import { IdpFileMetadata } from '../../models/api-models/idp-api-recognition-models';

type CacheUpdate = { key: string; value: IdpImageInfo; op: 'add' } | { op: 'clear' };

@Injectable()
export class IdpSharedImageLoadingService implements OnDestroy {
    readonly maxCacheSize = 140; // max expected pages per document
    private readonly maxPageCacheSize = this.maxCacheSize * 2; // double size for thumbnails and full images
    private readonly cacheUpdate$ = new Subject<CacheUpdate>();
    private readonly cache$: Observable<Record<string, IdpImageInfo>>;
    private readonly metadataCache = new Map<string, IdpFileMetadata>();
    private readonly pendingMetadataRequests = new Map<string, Observable<IdpFileMetadata | undefined>>();

    private readonly cancel$ = new Subject<void>();

    constructor(private readonly idpBackendService: IdpBackendService, private readonly destroyRef: DestroyRef) {
        this.cache$ = this.cacheUpdate$.pipe(
            takeUntilDestroyed(this.destroyRef),
            scan((cache, update) => {
                switch (update.op) {
                    case 'add': {
                        if (Object.keys(cache).length >= this.maxPageCacheSize) {
                            const [key] = Object.keys(cache);
                            URL.revokeObjectURL(cache[key].blobUrl);
                            delete cache[key];
                        }
                        cache[update.key] = update.value;
                        break;
                    }
                    case 'clear': {
                        for (const data of Object.values(cache)) {
                            URL.revokeObjectURL(data.blobUrl);
                        }
                        cache = {};
                        break;
                    }
                }
                return cache;
            }, {} as Record<string, IdpImageInfo>),
            startWith({}),
            shareReplay({ bufferSize: 1, refCount: false })
        );
    }

    ngOnDestroy(): void {
        this.clearCache();
        this.cancel$.next();
        this.cancel$.complete();
    }

    cleanup(): void {
        this.clearCache();
        this.cancel$.next();
    }

    getImageDataForPage$(page: IdpDocumentPage, correlationId: string, thumbnail: boolean = false): Observable<IdpImageInfo | undefined> {
        const { fileReference, sourcePageIndex } = page;
        const pageId = page.id;

        return this.cache$.pipe(
            take(1),
            switchMap((cache) => this.loadImageData$(cache, page, correlationId, thumbnail, pageId, fileReference, sourcePageIndex))
        );
    }

    private loadImageData$(
        cache: Record<string, IdpImageInfo>,
        page: IdpDocumentPage,
        correlationId: string,
        thumbnail: boolean,
        pageId: string,
        fileReference: string,
        sourcePageIndex: number
    ): Observable<IdpImageInfo | undefined> {
        const cachedData = cache[thumbnail ? `${pageId}_thumbnail` : pageId];
        if (cachedData) {
            return of({ ...cachedData, viewerRotation: page.viewerRotation ?? cachedData.viewerRotation });
        }

        return thumbnail
            ? this.getThumbnailImageData$(correlationId, fileReference, sourcePageIndex, pageId)
            : this.getOriginalImageData$(correlationId, fileReference, sourcePageIndex, pageId, page);
    }

    private getThumbnailImageData$(
        correlationId: string,
        fileReference: string,
        sourcePageIndex: number,
        pageId: string
    ): Observable<IdpImageInfo | undefined> {
        return this.idpBackendService.getFilePageImageBlob$(correlationId, fileReference, sourcePageIndex, true).pipe(
            switchMap((blobUrl) => this.createImageDataFromBlob$(blobUrl, { width: 100, height: 100 })),
            tap(this.cacheImageData.bind(this, `${pageId}_thumbnail`)),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    private getOriginalImageData$(
        correlationId: string,
        fileReference: string,
        sourcePageIndex: number,
        pageId: string,
        page: IdpDocumentPage
    ): Observable<IdpImageInfo | undefined> {
        if (!fileReference) {
            return of(undefined);
        }

        const fileMetadataCache = this.metadataCache.get(fileReference);
        if (fileMetadataCache) {
            return this.processPageMetadata$(fileMetadataCache, correlationId, fileReference, sourcePageIndex, page, pageId);
        }

        if (!this.pendingMetadataRequests.has(fileReference)) {
            const metadataRequest$ = this.idpBackendService.getFileMetadata$(correlationId, fileReference).pipe(
                tap((fileMetadata) => {
                    if (fileMetadata) {
                        this.cacheData(this.metadataCache, fileReference, fileMetadata);
                    }
                }),
                finalize(() => this.pendingMetadataRequests.delete(fileReference)),
                shareReplay({ bufferSize: 1, refCount: false }),
                takeUntilDestroyed(this.destroyRef)
            );
            this.pendingMetadataRequests.set(fileReference, metadataRequest$);
        }

        return (this.pendingMetadataRequests.get(fileReference) ?? of(undefined)).pipe(
            switchMap((fileMetadata) =>
                fileMetadata ? this.processPageMetadata$(fileMetadata, correlationId, fileReference, sourcePageIndex, page, pageId) : of(undefined)
            ),
            catchError(() => of(undefined))
        );
    }

    private processPageMetadata$(
        fileMetadata: IdpFileMetadata,
        correlationId: string,
        fileReference: string,
        sourcePageIndex: number,
        page: IdpDocumentPage,
        pageId: string
    ): Observable<IdpImageInfo | undefined> {
        const pageMetadata = fileMetadata.pages.find((p) => p.pageIndex === sourcePageIndex);
        if (!pageMetadata) {
            return of(undefined);
        }

        return this.idpBackendService.getFilePageImageBlob$(correlationId, fileReference, sourcePageIndex).pipe(
            switchMap((blobUrl) => {
                const correctionAngle = (360 - pageMetadata.rotation) % 360;
                const viewerRotation = page.viewerRotation ?? 0;
                return this.createImageDataFromBlob$(blobUrl, {
                    width: pageMetadata.imageWidth,
                    height: pageMetadata.imageHeight,
                    viewerRotation,
                    correctionAngle,
                    skew: pageMetadata.skew,
                });
            }),
            tap((imageData) => this.cacheImageData(pageId, imageData)),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    private createImageDataFromBlob$(blobUrl: string | undefined, metadata: Partial<IdpImageInfo>): Observable<IdpImageInfo | undefined> {
        if (!blobUrl) {
            return of(undefined);
        }
        return of({
            blobUrl,
            ...metadata,
        } as IdpImageInfo);
    }

    private cacheImageData(pageId: string, imageData: IdpImageInfo | undefined): void {
        if (!pageId || !imageData) {
            return;
        }

        this.cacheUpdate$.next({ key: pageId, value: imageData, op: 'add' });
    }

    private cacheData<T>(cache: Map<string, T>, cacheId: string, data: T | undefined, maxCacheSize: number = this.maxCacheSize): void {
        if (!cacheId || !data) {
            return;
        }

        if (cache.size >= maxCacheSize) {
            const key = cache.keys().next().value;
            if (key) {
                cache.delete(key);
            }
        }
        cache.set(cacheId, data);
    }

    private clearCache(): void {
        this.cacheUpdate$.next({ op: 'clear' });
        this.metadataCache.clear();
        this.pendingMetadataRequests.clear();
    }
}
