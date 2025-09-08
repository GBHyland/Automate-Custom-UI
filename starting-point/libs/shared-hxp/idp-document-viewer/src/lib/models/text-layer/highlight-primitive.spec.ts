/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HighlightPrimitive } from './highlight-primitive';
import { ViewerTextData, ViewerOcrCandidate } from './ocr-candidate';

describe('HighlightPrimitive', () => {
    it('should create an instance from ViewerTextData', () => {
        const data: ViewerTextData = {
            left: 10,
            top: 20,
            width: 100,
            height: 50,
            pageId: '1',
            text: 'data',
            highlightState: 'VALID',
            additionalData: 'some highlight data',
        };

        const instance = HighlightPrimitive.fromTextData(data);

        expect(instance).toBeInstanceOf(HighlightPrimitive);
        expect(instance.rect.left).toBe(10);
        expect(instance.rect.top).toBe(20);
        expect(instance.rect.width).toBe(100);
        expect(instance.rect.height).toBe(50);
        expect(instance.scaleFactor).toBe(1);
        expect(instance.textData.highlightState).toBe('VALID');
        expect(instance.textData.additionalData).toBe('some highlight data');
    });

    it('should create an instance from ViewerOcrCandidate', () => {
        const data: ViewerOcrCandidate = {
            left: 15,
            top: 25,
            width: 110,
            height: 60,
            pageId: '1',
            text: 'OCR text',
        };

        const instance = HighlightPrimitive.fromTextData(data);

        expect(instance).toBeInstanceOf(HighlightPrimitive);
        expect(instance.rect.left).toBe(15);
        expect(instance.rect.top).toBe(25);
        expect(instance.rect.width).toBe(110);
        expect(instance.rect.height).toBe(60);
        expect(instance.scaleFactor).toBe(1);
        expect(instance.textData.highlightState).toBe('DEFAULT');
        expect(instance.textData.text).toBe('OCR text');
    });

    it('should create an instance with border', () => {
        const data: ViewerTextData = {
            left: 10,
            top: 20,
            width: 100,
            height: 50,
            highlightState: 'VALID',
            additionalData: 'table border data',
            isBorder: true,
            text: '',
            pageId: '1',
        };

        const instance = HighlightPrimitive.fromTextData(data);

        expect(instance).toBeInstanceOf(HighlightPrimitive);
        expect(instance.rect.left).toBe(10);
        expect(instance.rect.top).toBe(20);
        expect(instance.rect.width).toBe(100);
        expect(instance.rect.height).toBe(50);
        expect(instance.scaleFactor).toBe(1);
        expect(instance.textData.highlightState).toBe('VALID');
        expect(instance.textData.additionalData).toBe('table border data');
    });
});
