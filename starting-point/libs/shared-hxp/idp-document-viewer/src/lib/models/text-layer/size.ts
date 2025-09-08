/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface MinimalSize {
    width: number;
    height: number;
}

export interface Rect extends MinimalSize {
    left: number;
    top: number;
}

export interface TextRect extends Rect {
    text: string;
}

export interface ScaledSizeInfo extends Rect {
    scale: number;
    baseSize: MinimalSize;
}

export interface Point {
    x: number;
    y: number;
}
