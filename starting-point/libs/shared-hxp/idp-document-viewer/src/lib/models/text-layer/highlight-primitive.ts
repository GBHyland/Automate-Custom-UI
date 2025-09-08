/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DrawStyles } from './drawing-config';
import { DrawingMethods } from './drawing-methods';
import { ViewerOcrCandidate, ViewerTextData } from './ocr-candidate';
import { PrimitiveElement, TextData } from './primitive-element';

export class HighlightPrimitive extends PrimitiveElement {
    private constructor(left: number, top: number, width: number, height: number, scale: number, textData: TextData, isBorder = false) {
        super(
            left,
            top,
            width,
            height,
            scale,
            {
                state: textData.highlightState,
                drawingMethod: isBorder ? DrawingMethods.drawRectangle : DrawingMethods.drawBlock,
            },
            textData
        );
    }

    static fromTextData(data: ViewerTextData | ViewerOcrCandidate) {
        return new HighlightPrimitive(
            data.left,
            data.top,
            data.width,
            data.height,
            1,
            {
                ...data,
                highlightState: 'highlightState' in data ? data.highlightState : DrawStyles.DEFAULT,
                additionalData: 'additionalData' in data ? data.additionalData : undefined,
            },
            'isBorder' in data ? data.isBorder : false
        );
    }
}
