/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TransformPascalCaseStringPipe } from './capitalize-string.pipe';

describe('TransformPascalCaseStringPipe', () => {
    let pipe: TransformPascalCaseStringPipe;

    beforeAll(() => {
        pipe = new TransformPascalCaseStringPipe();
    });

    it('should transform pascal case', () => {
        expect(pipe.transform('Pascal_Case')).toBe('Pascal Case');
        expect(pipe.transform('Pascal__Case')).toBe('Pascal Case');
        expect(pipe.transform('_Pascal_Case')).toBe('Pascal Case');
        expect(pipe.transform('Pascal_Case_')).toBe('Pascal Case');
        expect(pipe.transform('_Pascal_Case_')).toBe('Pascal Case');
        expect(pipe.transform('__Pascal__Case__')).toBe('Pascal Case');
    });

    it('should capitalize first letter of every word', () => {
        expect(pipe.transform('paScAl_cAse')).toBe('PaScAl CAse');
    });

    it('should return empty string when empty string is input', () => {
        expect(pipe.transform('')).toBe('');
    });

    it('should return empty string when only underscores are input', () => {
        expect(pipe.transform('_')).toBe('');
        expect(pipe.transform('___')).toBe('');
    });
});
