/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { SHOULD_ADD_AUTH_TOKEN } from '@alfresco/adf-core/auth';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
    IdpActionTypes,
    IdpApiRecognitionJobPostResponse,
    IdpContentFileProcessingRequest,
    IdpFileMetadata,
    IdpFilePageOcrData,
} from '../../models/api-models/idp-api-recognition-models';
import { DownloadApi } from '@hylandsoftware/hxcs-js-client';
import { DEFAULT_REPOSITORY_ID, DOWNLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { pollUntilSuccess } from '../../extensions/rxjs.extensions';
import { ResponseFormat } from '../../models/common-models';

class IdpUrlEndpoint {
    service: string;
    endpoint: string;

    constructor(service: string, endpoint: string) {
        this.service = service;
        this.endpoint = endpoint;
    }

    build() {
        return `api/${this.service}/${this.endpoint}`;
    }
}

const IDP_SERVICE_REPLACE_PLACEHOLDER = '<SERVICE_PLACEHOLDER>';
const IDP_POLLING_INTERVAL = 30000;
const IDP_POLLING_MAX_ATTEMPTS = 60;

const IDP_SERVICES = {
    RECOGNITION_SERVICE: 'recognition',
} as const;

const IDP_URLS = {
    FILE_PAGE: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/page'),
    FILE_METADATA: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/metadata'),
    FILE_PAGE_OCR: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/page/ocr'),
    FILE_ROTATION_UPDATE: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'files'),
    OCR_DOCUMENTS: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file'),
} as const;

@Injectable()
export class IdpBackendService {
    private readonly appConfig = inject(AppConfigService);
    private readonly httpClient = inject(HttpClient);
    private lazyDownloadApi: DownloadApi | undefined;
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    getFileMetadata$(correlationId: string, fileReference: string): Observable<IdpFileMetadata | undefined> {
        const pollJobQueryParams = new HttpParams().set('correlationId', correlationId).set('fileReference', fileReference);

        return this.request$<IdpFileMetadata>('GET', IDP_URLS.FILE_METADATA, { queryParams: pollJobQueryParams }).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((response) => {
                if (response?.status !== 'Succeeded') {
                    throw new Error('Failed to get file metadata');
                }

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 404) {
                    return this.extractDocumentMetadata$(correlationId, fileReference);
                }
                return of(undefined);
            }),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined))
        );
    }

    getPageOcr$(
        correlationId: string,
        fileReference: string,
        pageIndex: number,
        responseFormat: ResponseFormat
    ): Observable<IdpFilePageOcrData | undefined> {
        const queryParams = new HttpParams()
            .set('correlationId', correlationId)
            .set('fileReference', fileReference)
            .set('pageIndex', pageIndex)
            .set('responseFormat', responseFormat);
        return this.request$<IdpFilePageOcrData>('GET', IDP_URLS.FILE_PAGE_OCR, { queryParams: queryParams }).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 404) {
                    return this.ocrDocumentPage$(correlationId, fileReference, pageIndex, responseFormat);
                }
                return of(undefined);
            }),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined)),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    getFilePageImageBlob$(
        correlationId: string,
        fileReference: string,
        pageIndex: number,
        thumbnail = false,
        imageAsUrl = true
    ): Observable<string | undefined> {
        const pollJobQueryParams = new HttpParams()
            .set('correlationId', correlationId)
            .set('fileReference', fileReference)
            .set('pageIndex', pageIndex)
            .set('thumbnail', thumbnail)
            .set('imageAsUrl', imageAsUrl);
        return this.getImageBlob$(IDP_URLS.FILE_PAGE, { queryParams: pollJobQueryParams }).pipe(
            takeUntilDestroyed(this.destroyRef),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined))
        );
    }

    updateRotationData$(
        correlationId: string,
        fileReferences: string[],
        pages: Array<{ contentFileReferenceIndex: number; pageIndex: number; rotation: number }>
    ): Observable<any> {
        const jobRequestData = {
            correlationId,
            contentFileReferences: fileReferences.map((fileReference) => {
                return {
                    fileReference,
                    sourceUrl: '',
                };
            }),
            pages,
        };

        return this.request$<any>('PUT', IDP_URLS.FILE_ROTATION_UPDATE, { bodyParam: jobRequestData }).pipe(takeUntilDestroyed(this.destroyRef));
    }

    extractDocumentMetadata$(correlationId: string, fileReference: string) {
        const queryParams = new HttpParams().set('correlationId', correlationId).set('fileReference', fileReference);
        const pollAction = () => this.request$<IdpFileMetadata>('GET', IDP_URLS.FILE_METADATA, { queryParams: queryParams });
        const successCondition = (data: IdpFileMetadata) => data.status === 'Succeeded';

        return this.getPresignedUrl$(fileReference).pipe(
            switchMap((sourceUrl) => this.postToRecognitionService$(correlationId, fileReference, sourceUrl, IdpActionTypes.MetadataExtraction)),
            pollUntilSuccess(pollAction, successCondition, IDP_POLLING_MAX_ATTEMPTS, IDP_POLLING_INTERVAL)
        );
    }

    ocrDocumentPage$(
        correlationId: string,
        fileReference: string,
        pageIndex: number,
        responseFormat: ResponseFormat
    ): Observable<IdpFilePageOcrData | undefined> {
        const queryParams = new HttpParams()
            .set('correlationId', correlationId)
            .set('fileReference', fileReference)
            .set('pageIndex', pageIndex)
            .set('responseFormat', responseFormat);
        const pollAction = () => this.request$<IdpFilePageOcrData>('GET', IDP_URLS.FILE_PAGE_OCR, { queryParams: queryParams });
        const successCondition = (data: IdpFilePageOcrData) => data.status === 'Succeeded';
        return this.getPresignedUrl$(fileReference).pipe(
            switchMap((sourceUrl) => this.postToRecognitionService$(correlationId, fileReference, sourceUrl, IdpActionTypes.Ocr)),
            pollUntilSuccess(pollAction, successCondition, IDP_POLLING_MAX_ATTEMPTS, IDP_POLLING_INTERVAL)
        );
    }

    private getPresignedUrl$(fileReference: string): Observable<string> {
        const downloadApi = this.getDownloadApi();
        if (downloadApi) {
            return from(downloadApi.downloadUrlByIdAndXPath(fileReference, 'sysfile_blob', 6000, DEFAULT_REPOSITORY_ID)).pipe(
                switchMap(({ data }) => of(data))
            );
        }
        return throwError(() => new Error('Unable to inject DownloadApi'));
    }

    private getDownloadApi(): DownloadApi | undefined {
        if (!this.lazyDownloadApi) {
            this.lazyDownloadApi = this.injector.get(DOWNLOAD_API_TOKEN);
        }
        return this.lazyDownloadApi;
    }

    private postToRecognitionService$(
        correlationId: string,
        fileReference: string,
        sourceUrl: string,
        actions: IdpActionTypes = IdpActionTypes.Ocr
    ): Observable<IdpApiRecognitionJobPostResponse> {
        const jobData: IdpContentFileProcessingRequest = {
            correlationId,
            fileReference,
            sourceUrl,
            actions,
        };
        return this.request$<IdpApiRecognitionJobPostResponse>('POST', IDP_URLS.OCR_DOCUMENTS, { bodyParam: jobData });
    }

    private getImageBlob$(
        endPoint: IdpUrlEndpoint,
        options: {
            queryParams?: HttpParams;
        }
    ): Observable<string> {
        const url = this.buildUrl(endPoint);

        return this.httpClient
            .get<{ url: string }>(url, {
                context: new HttpContext().set(SHOULD_ADD_AUTH_TOKEN, true),
                params: options.queryParams,
                responseType: 'json',
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
            })
            .pipe(map((response) => response.url));
    }

    private buildUrl(endPoint: IdpUrlEndpoint): string {
        const baseUrl = this.appConfig.get<string>('hxIdpHost').replace(IDP_SERVICE_REPLACE_PLACEHOLDER, endPoint.service);
        return new URL(endPoint.build(), baseUrl).toString();
    }

    private request$<T>(
        httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endPoint: IdpUrlEndpoint,
        options: {
            bodyParam?: unknown;
            queryParams?: HttpParams;
        }
    ): Observable<T> {
        const url = this.buildUrl(endPoint);

        return this.httpClient.request<T>(httpMethod, url, {
            context: new HttpContext().set(SHOULD_ADD_AUTH_TOKEN, true),
            body: options.bodyParam,
            params: options.queryParams,
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        });
    }
}
