/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { DownloadApi } from '@hylandsoftware/hxcs-js-client';
import { v4 as uuidv4 } from 'uuid';

import { DEFAULT_REPOSITORY_ID } from '@alfresco/adf-hx-content-services/api/models/default-repository.model';
import {
    IdpActionTypes,
    IdpContentFileProcessingRequest,
    IdpFileMetadata,
    IdpFilePageOcrData,
} from '@hxp/workspace-hxp/idp-services-extension/shared/models/api-models/idp-api-recognition-models';

import { HxprApi } from '../../../../api/hxpr-api';
import { CustomAPIRequest } from '../../../context-factory/context.models';
import { ModelData } from '../../../models';
import { BaseService, RequestResponse } from '../../base.service';

enum IdpRecognitionApiEndpoints {
    FILE_PAGE = 'api/recognition/file/page',
    FILE_METADATA = 'api/recognition/file/metadata',
    FILE_PAGE_OCR = 'api/recognition/file/page/ocr',
    FILE = 'api/recognition/file',
}

export class IdpApiRecognitionEndpoint extends BaseService {
    private serviceUrl: string;

    static async getPresignedUrl$(downloadApi: HxprApi | DownloadApi, fileReference: string): Promise<string> {
        if (downloadApi instanceof HxprApi) {
            downloadApi = downloadApi.downloadApi;
        }
        const response = await downloadApi.downloadUrlByIdAndXPath(fileReference, 'sysfile_blob', 600, DEFAULT_REPOSITORY_ID);
        return response.data;
    }

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.serviceUrl = `${serviceUrl}`;
    }

    async uploadFakeFile(correlationId: string): Promise<ModelData | RequestResponse> {
        return this.postFile(correlationId, uuidv4());
    }

    async uploadFakeFiles(correlationId: string, fileNo: number): Promise<void> {
        for (let i = 0; i < fileNo; i++) {
            await this.uploadFakeFile(correlationId);
        }
    }

    private serviceUri(endPoint: IdpRecognitionApiEndpoints): string {
        return `${this.serviceUrl}/${endPoint}`;
    }

    getFileMetadata(correlationId: string, fileReference: string): Promise<IdpFileMetadata | RequestResponse> {
        return this.get(this.serviceUri(IdpRecognitionApiEndpoints.FILE_METADATA), {
            headers: {
                // eslint-disable-next-line prettier/prettier
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            params: {
                correlationId,
                fileReference,
            },
        });
    }

    getFilePageOcr(correlationId: string, fileReference: string, pageIndex: number): Promise<IdpFilePageOcrData | RequestResponse> {
        return this.get(this.serviceUri(IdpRecognitionApiEndpoints.FILE_PAGE_OCR), {
            headers: {
                // eslint-disable-next-line prettier/prettier
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            params: {
                correlationId,
                fileReference,
                pageIndex,
            },
        });
    }

    async postFile(
        correlationId: string,
        fileReference: string,
        actions?: IdpActionTypes,
        sourceUrlOrDownloadApi?: string | HxprApi | DownloadApi
    ): Promise<RequestResponse> {
        if (typeof sourceUrlOrDownloadApi === 'object') {
            sourceUrlOrDownloadApi = await IdpApiRecognitionEndpoint.getPresignedUrl$(sourceUrlOrDownloadApi, fileReference);
        }
        const jobData: IdpContentFileProcessingRequest = {
            correlationId,
            fileReference,
            sourceUrl: sourceUrlOrDownloadApi,
            actions,
        };
        return this.post(this.serviceUri(IdpRecognitionApiEndpoints.FILE), {
            headers: {
                // eslint-disable-next-line prettier/prettier
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            data: jobData,
        });
    }
}
