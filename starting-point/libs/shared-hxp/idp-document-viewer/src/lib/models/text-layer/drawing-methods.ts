/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DrawStyles } from './drawing-config';
import { PrimitiveElement } from './primitive-element';
import { MinimalSize, Point } from './size';

type PrimitiveConfig = Pick<PrimitiveElement, 'rect' | 'drawingConfig'>;

interface DrawingConfig {
    backgroundColor: string;
    color: string;
    opacity: number;
}

export const DrawingMethods = {
    drawBlock(context: CanvasRenderingContext2D, primitive: PrimitiveConfig) {
        const drawConfig = resolveDrawingConfig(context, primitive.drawingConfig.state);
        context.fillStyle = drawConfig.backgroundColor;
        context.globalAlpha = drawConfig.opacity;
        context.fillRect(primitive.rect.left, primitive.rect.top, primitive.rect.width, primitive.rect.height);
    },

    drawRectangle(
        context: CanvasRenderingContext2D,
        primitive: PrimitiveConfig,
        lineStyle: 'solid' | 'dashed' = 'solid',
        lineWidth = 2,
        overrides?: { opacity: number }
    ) {
        const drawConfig = resolveDrawingConfig(context, primitive.drawingConfig.state);
        context.beginPath();
        if (lineStyle === 'dashed') {
            context.setLineDash([8, 10]);
        }
        context.globalAlpha = overrides?.opacity === undefined ? drawConfig.opacity : overrides.opacity;
        context.rect(primitive.rect.left, primitive.rect.top, primitive.rect.width, primitive.rect.height);
        context.strokeStyle = drawConfig.color;
        context.lineWidth = lineWidth;
        context.stroke();
    },

    drawLine(context: CanvasRenderingContext2D, primitive: PrimitiveConfig, pointStart: Point, pointEnd: Point) {
        const drawConfig = resolveDrawingConfig(context, primitive.drawingConfig.state);
        context.beginPath();
        context.setLineDash([10, 15]);
        context.globalAlpha = 1;
        context.moveTo(pointStart.x, pointStart.y);
        context.lineTo(pointEnd.x, pointEnd.y);
        context.strokeStyle = drawConfig.color;
        context.lineWidth = 3;
        context.stroke();
    },

    drawRubberBand(context: CanvasRenderingContext2D, primitive: PrimitiveConfig, canvasSize: MinimalSize) {
        context.globalCompositeOperation = 'xor';
        if (primitive.rect.left <= 0 || primitive.rect.top <= 0) {
            context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        } else if (primitive.rect.height !== 0 && primitive.rect.width !== 0) {
            // upper portion
            DrawingMethods.drawBlock(context, {
                ...primitive,
                rect: {
                    left: 0,
                    top: 0,
                    width: canvasSize.width,
                    height:
                        primitive.rect.top + primitive.rect.height > primitive.rect.top
                            ? primitive.rect.top
                            : primitive.rect.top + primitive.rect.height,
                },
            });

            // lower portion
            DrawingMethods.drawBlock(context, {
                ...primitive,
                rect: {
                    left: 0,
                    top:
                        primitive.rect.top + primitive.rect.height > primitive.rect.top
                            ? primitive.rect.top + primitive.rect.height
                            : primitive.rect.top,
                    width: canvasSize.width,
                    height: canvasSize.height,
                },
            });

            // left block
            DrawingMethods.drawBlock(context, {
                ...primitive,
                rect: {
                    left: 0,
                    top: primitive.rect.top,
                    width:
                        primitive.rect.left + primitive.rect.width > primitive.rect.left
                            ? primitive.rect.left
                            : primitive.rect.left + primitive.rect.width,
                    height: primitive.rect.height,
                },
            });

            // right block
            DrawingMethods.drawBlock(context, {
                ...primitive,
                rect: {
                    left:
                        primitive.rect.left + primitive.rect.width > primitive.rect.left
                            ? primitive.rect.left + primitive.rect.width
                            : primitive.rect.left,
                    top: primitive.rect.top,
                    width: canvasSize.width,
                    height: primitive.rect.height,
                },
            });

            // dashed rectangle
            DrawingMethods.drawRectangle(
                context,
                {
                    ...primitive,
                    rect: {
                        left: primitive.rect.left,
                        top: primitive.rect.top,
                        width: primitive.rect.width,
                        height: primitive.rect.height,
                    },
                },
                'dashed',
                2,
                { opacity: 1 }
            );

            DrawingMethods.drawLine(context, primitive, { x: primitive.rect.left, y: 0 }, { x: primitive.rect.left, y: primitive.rect.top });
            DrawingMethods.drawLine(context, primitive, { x: 0, y: primitive.rect.top }, { x: primitive.rect.left, y: primitive.rect.top });
            DrawingMethods.drawLine(
                context,
                primitive,
                { x: primitive.rect.left + primitive.rect.width, y: primitive.rect.top + primitive.rect.height },
                { x: canvasSize.width, y: primitive.rect.top + primitive.rect.height }
            );
            DrawingMethods.drawLine(
                context,
                primitive,
                { x: primitive.rect.left + primitive.rect.width, y: primitive.rect.top + primitive.rect.height },
                { x: primitive.rect.left + primitive.rect.width, y: canvasSize.height }
            );
        }
    },
};

function resolveDrawingConfig(context: CanvasRenderingContext2D, drawStyle: DrawStyles): DrawingConfig {
    let cssVariableSuffix = '';
    switch (drawStyle) {
        case DrawStyles.RUBBER_BAND: {
            cssVariableSuffix = 'rubber-band';
            break;
        }
        case DrawStyles.VALID: {
            cssVariableSuffix = 'valid';
            break;
        }
        case DrawStyles.INVALID: {
            cssVariableSuffix = 'invalid';
            break;
        }
        case DrawStyles.PRIMARY: {
            cssVariableSuffix = 'primary';
            break;
        }
        default: {
            cssVariableSuffix = 'default';
            break;
        }
    }

    const color = resolveCssVariableValue(context, `--idp-viewer-text-layer-color-${cssVariableSuffix}`);
    const backgroundColor = resolveCssVariableValue(context, `--idp-viewer-text-layer-background-color-${cssVariableSuffix}`);
    const opacity = Number.parseFloat(resolveCssVariableValue(context, `--idp-viewer-text-layer-opacity-${cssVariableSuffix}`));

    return {
        color,
        backgroundColor,
        opacity: Math.min(opacity > 1 ? opacity / 100 : opacity, 1),
    };
}

function resolveCssVariableValue(context: CanvasRenderingContext2D, variableName: string): string {
    return getComputedStyle(context.canvas).getPropertyValue(variableName);
}
