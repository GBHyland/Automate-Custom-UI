/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { cloneDeep } from 'es-toolkit/compat';
import { DrawingConfig } from './drawing-config';
import { MinimalSize, Rect } from './size';
import { ViewerTextData, ViewerTextHighlightData } from './ocr-candidate';

export type TextData = Omit<ViewerTextData, keyof Rect>;

export abstract class PrimitiveElement {
    actualRect: Rect;
    rect: Rect;
    scaleFactor: number;
    drawingConfig: DrawingConfig;
    textData: TextData;

    constructor(left: number, top: number, width: number, height: number, scaleFactor: number, drawingConfig: DrawingConfig, textData: TextData) {
        this.actualRect = { left, top, width, height };
        this.rect = { ...this.actualRect };
        this.scaleFactor = scaleFactor;
        this.drawingConfig = cloneDeep(drawingConfig);
        this.textData = cloneDeep(textData);
        this.scale(scaleFactor);
    }

    scale(scaleFactor: number = this.scaleFactor) {
        this.scaleFactor = scaleFactor;
        this.rect.left = Math.round(this.actualRect.left * scaleFactor);
        this.rect.top = Math.round(this.actualRect.top * scaleFactor);
        this.rect.width = Math.round(this.actualRect.width * scaleFactor);
        this.rect.height = Math.round(this.actualRect.height * scaleFactor);
    }

    draw(context: CanvasRenderingContext2D, canvasSize: MinimalSize) {
        if (this.drawingConfig?.drawingMethod) {
            this.drawingConfig.drawingMethod(context, this, canvasSize);
        }
    }

    toTextHighlightData(): ViewerTextHighlightData {
        return {
            text: this.textData.text,
            pageId: this.textData.pageId,
            additionalData: this.textData.additionalData,
            rect: {
                actual: { ...this.actualRect },
                scaled: { ...this.rect },
                scale: this.scaleFactor,
            },
        };
    }
}
