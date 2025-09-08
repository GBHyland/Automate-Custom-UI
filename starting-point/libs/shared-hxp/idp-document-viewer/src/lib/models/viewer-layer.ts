/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TemplateRef } from '@angular/core';

export const ViewerLayerType = {
    Image: 'Image',
    TextSuperImposed: 'TextSuperImposed',
    TextOnly: 'TextOnly',
} as const;
export type ViewerLayerType = keyof typeof ViewerLayerType;

export type ViewerBaseLayerType = Exclude<ViewerLayerType, 'TextSuperImposed'>;

export interface ViewerLayer {
    type: ViewerLayerType;
    order: number;
    templateRef?: TemplateRef<unknown>;
}

export interface ViewerLayerHostData {
    documentId: string;
    pageId: string;
    contentNaturalWidth: number;
    contentNaturalHeight: number;
    correctionAngle?: number;
    viewerRotation?: number;
}

export function isValidLayerType(type: string): type is ViewerLayerType {
    return Object.values(ViewerLayerType).includes(type as ViewerLayerType);
}
