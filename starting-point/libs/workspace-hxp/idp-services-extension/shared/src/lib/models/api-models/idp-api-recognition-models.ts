/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum IdpActionTypes {
    None = 0,
    MetadataExtraction = 1,
    Ocr = 2,
    Omr = 4,
}

export interface IdpFileMetadata {
    status: 'Queued' | 'Processing' | 'Succeeded' | 'Failed';
    pageCount: number;
    pages: Array<{
        pageIndex: number;
        imageWidth: number;
        imageHeight: number;
        skew: number;
        rotation: number;
    }>;
}

export interface IdpFilePageOcrData {
    status: 'Queued' | 'Processing' | 'Succeeded' | 'Failed';
    fileReference: string;
    words: Array<{
        text: string;
        confidence: number;
        boundingBox: {
            top: number;
            left: number;
            width: number;
            height: number;
        };
    }>;
    layout: string;
}

export interface IdpApiRecognitionJobPostResponse {
    jobId: string;
}

export interface IdpContentFileProcessingRequest {
    correlationId: string;
    fileReference: string;
    sourceUrl: string;
    actions: IdpActionTypes;
}
