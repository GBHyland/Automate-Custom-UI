/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PrimitiveElement, TextData } from './primitive-element';
import { DrawingConfig, DrawStyles } from './drawing-config';

class TestPrimitiveElement extends PrimitiveElement {
    constructor(left: number, top: number, width: number, height: number, scaleFactor: number, drawingConfig: DrawingConfig, textData: TextData) {
        super(left, top, width, height, scaleFactor, drawingConfig, textData);
    }
}

describe('Idp Viewer PrimitiveElement', () => {
    let element: TestPrimitiveElement;
    let drawingConfig: DrawingConfig;
    let textData: TextData;

    beforeEach(() => {
        textData = { text: 'sample text', pageId: '1', highlightState: DrawStyles.DEFAULT, additionalData: {} };
        drawingConfig = { drawingMethod: jasmine.createSpy(), state: DrawStyles.DEFAULT };
        element = new TestPrimitiveElement(10, 20, 30, 40, 2, drawingConfig, textData);
    });

    it('should initialize with correct values', () => {
        expect(element.actualRect).toEqual({ left: 10, top: 20, width: 30, height: 40 });
        expect(element.rect).toEqual({ left: 20, top: 40, width: 60, height: 80 });
        expect(element.scaleFactor).toBe(2);
        expect(element.drawingConfig).toEqual(drawingConfig);
        expect(element.textData).toEqual(textData);
    });

    it('should scale correctly', () => {
        element.scale(3);
        expect(element.rect).toEqual({ left: 30, top: 60, width: 90, height: 120 });
    });

    it('should call drawing method on draw', () => {
        const context = {} as CanvasRenderingContext2D;
        const canvasSize = { width: 100, height: 100 };
        element.draw(context, canvasSize);
        expect(drawingConfig.drawingMethod).toHaveBeenCalledWith(context, element, canvasSize);
    });

    it('should return correct text highlight data', () => {
        const highlightData = element.toTextHighlightData();
        expect(highlightData).toEqual({
            text: 'sample text',
            pageId: '1',
            additionalData: {},
            rect: {
                actual: { left: 10, top: 20, width: 30, height: 40 },
                scaled: { left: 20, top: 40, width: 60, height: 80 },
                scale: 2,
            },
        });
    });
});
