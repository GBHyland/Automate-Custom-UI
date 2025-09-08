/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PrimitiveElement } from './primitive-element';

export const DrawStyles = {
    RUBBER_BAND: 'RUBBER_BAND',
    DEFAULT: 'DEFAULT',
    VALID: 'VALID',
    INVALID: 'INVALID',
    PRIMARY: 'PRIMARY',
    SECONDARY: 'SECONDARY',
} as const;
export type DrawStyles = keyof typeof DrawStyles;

export type DrawingMethod = (
    context: CanvasRenderingContext2D,
    primitive: PrimitiveElement | Pick<PrimitiveElement, 'rect' | 'drawingConfig'>,
    ...args: any[]
) => void;

export interface DrawingConfig {
    state: DrawStyles;
    drawingMethod: DrawingMethod;
}
