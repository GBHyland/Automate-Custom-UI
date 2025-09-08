/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { cloneDeep } from 'es-toolkit/compat';
import { DrawStyles } from './drawing-config';
import { DrawingMethods } from './drawing-methods';
import { PrimitiveElement } from './primitive-element';
import { Point } from './size';

class MockCanvasContext implements Partial<CanvasRenderingContext2D> {
    fillStyle = '';
    globalAlpha = 1;
    strokeStyle = '';
    lineWidth = 1;
    globalCompositeOperation = 'color' as const;
    fillRect = jasmine.createSpy('fillRect');
    setLineDash = jasmine.createSpy('setLineDash');
    rect = jasmine.createSpy('rect');
    stroke = jasmine.createSpy('stroke');
    beginPath = jasmine.createSpy('beginPath');
    moveTo = jasmine.createSpy('moveTo');
    lineTo = jasmine.createSpy('lineTo');
    clearRect = jasmine.createSpy('clearRect');
}

describe('Idp Viewer DrawingMethods', () => {
    let context: CanvasRenderingContext2D;
    let primitiveConfig: Pick<PrimitiveElement, 'rect' | 'drawingConfig'>;

    beforeEach(() => {
        primitiveConfig = {
            rect: { left: 10, top: 20, width: 100, height: 101 },
            drawingConfig: {
                state: DrawStyles.DEFAULT,
                drawingMethod: DrawingMethods.drawBlock,
            },
        };

        context = new MockCanvasContext() as unknown as CanvasRenderingContext2D;

        spyOn(window, 'getComputedStyle').and.callFake(() => {
            return {
                getPropertyValue: (variable: string) => variable,
            } as unknown as CSSStyleDeclaration;
        });
    });

    for (const [drawState, variable] of [
        [DrawStyles.DEFAULT, 'default'],
        [DrawStyles.SECONDARY, 'default'],
        [DrawStyles.VALID, 'valid'],
        [DrawStyles.INVALID, 'invalid'],
        [DrawStyles.RUBBER_BAND, 'rubber-band'],
        [DrawStyles.PRIMARY, 'primary'],
    ]) {
        it(`should draw a block with ${drawState} drawing config state`, () => {
            const testPrimitive = cloneDeep(primitiveConfig);
            testPrimitive.drawingConfig.state = drawState as DrawStyles;
            DrawingMethods.drawBlock(context, testPrimitive);
            expect(context.fillStyle).toEqual(`--idp-viewer-text-layer-background-color-${variable}`);
            expect(context.fillRect).toHaveBeenCalledWith(10, 20, 100, 101);
        });
    }

    it('should draw a solid rectangle', () => {
        DrawingMethods.drawRectangle(context, primitiveConfig);
        expect(context.strokeStyle).toEqual('--idp-viewer-text-layer-color-default');
        expect(context.lineWidth).toEqual(2);
        expect(context.rect).toHaveBeenCalledWith(10, 20, 100, 101);
        expect(context.stroke).toHaveBeenCalled();
        expect(context.setLineDash).not.toHaveBeenCalled();
    });

    it('should draw a dashed rectangle', () => {
        DrawingMethods.drawRectangle(context, primitiveConfig, 'dashed');
        expect(context.lineWidth).toEqual(2);
        expect(context.rect).toHaveBeenCalledWith(10, 20, 100, 101);
        expect(context.stroke).toHaveBeenCalled();
        expect(context.setLineDash).toHaveBeenCalled();
    });

    it('should draw a solid rectangle with 5 line width', () => {
        DrawingMethods.drawRectangle(context, primitiveConfig, 'solid', 5);
        expect(context.lineWidth).toEqual(5);
    });

    it('should draw a solid rectangle with override opacity', () => {
        DrawingMethods.drawRectangle(context, primitiveConfig, 'solid', 2, { opacity: 0.5 });
        expect(context.lineWidth).toEqual(2);
        expect(context.globalAlpha).toEqual(0.5);
    });

    it('should draw a line', () => {
        const pointStart: Point = { x: 10, y: 10 };
        const pointEnd: Point = { x: 50, y: 50 };
        DrawingMethods.drawLine(context, primitiveConfig, pointStart, pointEnd);
        expect(context.strokeStyle).toEqual('--idp-viewer-text-layer-color-default');
        expect(context.lineWidth).toEqual(3);
        expect(context.beginPath).toHaveBeenCalled();
        expect(context.moveTo).toHaveBeenCalledWith(10, 10);
        expect(context.lineTo).toHaveBeenCalledWith(50, 50);
        expect(context.stroke).toHaveBeenCalled();
    });

    it('should draw a rubber band', () => {
        const canvasSize = { width: 200, height: 200 };
        DrawingMethods.drawRubberBand(context, primitiveConfig, canvasSize);
        expect(context.globalCompositeOperation).toEqual('xor');
        expect(context.clearRect).not.toHaveBeenCalled();
        expect(context.fillRect).toHaveBeenCalledTimes(4);
    });

    it('should clear the canvas if the rubber band is out of bounds', () => {
        const canvasSize = { width: 200, height: 200 };
        DrawingMethods.drawRubberBand(context, { ...primitiveConfig, rect: { left: -1, top: -1, width: 0, height: 0 } }, canvasSize);
        expect(context.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
    });
});
