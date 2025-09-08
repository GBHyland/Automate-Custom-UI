/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Observable } from 'rxjs';
import { ViewerOcrCandidate } from './text-layer/ocr-candidate';

export interface IdpDocument {
    id: string;
    name: string;
    pages: IdpPage[];
}

export interface IdpPage {
    id: string;
    name: string;
    viewerRotation?: number;
    isSelected: boolean;
    panelClasses?: string[];
}

export interface ImageData {
    blobUrl: string;
    width: number;
    height: number;
    correctionAngle?: number;
    viewerRotation?: number;
    skew?: number;
}

export const ResponseFormat = {
    Ocr: 'Ocr',
    TextLayout: 'TextLayout',
} as const;

export type ResponseFormat = typeof ResponseFormat[keyof typeof ResponseFormat];

export interface Datasource {
    documents: IdpDocument[];
    loadImageFn: (pageId: string) => Observable<ImageData> | Promise<ImageData> | ImageData;
    loadThumbnailFn: (pageId: string) => Observable<string> | Promise<string> | string;
}

export interface DatasourceOcr extends Datasource {
    loadPageOcrFn: (pageId: string, responseFormat?: ResponseFormat) => Observable<string | ViewerOcrCandidate[]> | ViewerOcrCandidate[] | string;
}

export function isDatasourceOcr(datasource: Datasource | DatasourceOcr): datasource is DatasourceOcr {
    return (datasource as DatasourceOcr).loadPageOcrFn !== undefined;
}
