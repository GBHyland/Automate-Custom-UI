/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DrawStyles } from './drawing-config';
import { DrawingMethods } from './drawing-methods';
import { PrimitiveElement, TextData } from './primitive-element';

export class RubberBandPrimitive extends PrimitiveElement {
    private constructor(left: number, top: number, width: number, height: number, scale: number, textData: TextData) {
        super(
            left,
            top,
            width,
            height,
            scale,
            {
                state: DrawStyles.RUBBER_BAND,
                drawingMethod: DrawingMethods.drawRubberBand,
            },
            textData
        );
    }

    static newInstance(scaledLeft: number, scaledTop: number, scaledWidth: number, scaledHeight: number, scale: number) {
        const left = scaledLeft / scale;
        const top = scaledTop / scale;
        const width = scaledWidth / scale;
        const height = scaledHeight / scale;
        return new RubberBandPrimitive(left, top, width, height, scale, {
            text: '',
            pageId: '',
            highlightState: DrawStyles.DEFAULT,
        });
    }

    setLeftScaled(left: number, scale: number) {
        this.scaleFactor = scale;
        const actualLeft = left / scale;
        this.actualRect.left = actualLeft;
        this.scale(this.scaleFactor);
    }

    setTopScaled(top: number, scale: number) {
        this.scaleFactor = scale;
        const actualTop = top / scale;
        this.actualRect.top = actualTop;
        this.scale(this.scaleFactor);
    }

    setWidthScaled(width: number, scale: number) {
        this.scaleFactor = scale;
        const actualWidth = width / scale;
        this.actualRect.width = actualWidth;
        this.scale(this.scaleFactor);
    }

    setHeightScaled(height: number, scale: number) {
        this.scaleFactor = scale;
        const actualHeight = height / scale;
        this.actualRect.height = actualHeight;
        this.scale(this.scaleFactor);
    }

    setText(text: string, pageId: string) {
        this.textData.text = text;
        this.textData.pageId = pageId;
    }

    isPointWithinScaled(scaledX: number, scaledY: number) {
        let x1 = this.rect.left;
        let x2 = this.rect.left + this.rect.width;
        let y1 = this.rect.top;
        let y2 = this.rect.top + this.rect.height;

        if (x1 > x2) {
            x1 = x1 + x2;
            x2 = x1 - x2;
            x1 = x1 - x2;
        }
        if (y1 > y2) {
            y1 = y1 + y2;
            y2 = y1 - y2;
            y1 = y1 - y2;
        }
        return scaledX >= x1 && scaledX <= x2 && scaledY >= y1 && scaledY <= y2;
    }

    equals(other: RubberBandPrimitive | undefined) {
        return (
            other !== undefined &&
            this.actualRect.left === other.actualRect.left &&
            this.actualRect.top === other.actualRect.top &&
            this.actualRect.width === other.actualRect.width &&
            this.actualRect.height === other.actualRect.height &&
            this.rect.left === other.rect.left &&
            this.rect.top === other.rect.top &&
            this.rect.width === other.rect.width &&
            this.rect.height === other.rect.height &&
            this.textData.text === other.textData.text
        );
    }
}
