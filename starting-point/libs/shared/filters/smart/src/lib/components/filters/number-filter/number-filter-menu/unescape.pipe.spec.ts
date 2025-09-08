/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UnescapePipe } from './unescape.pipe';

describe('UnescapePipe', () => {
    let pipe: UnescapePipe;

    beforeEach(() => {
        pipe = new UnescapePipe();
    });

    it('should unescape HTML entities', () => {
        const escapedStrings = ['&lt', '&gt;', 'Hello', '&le;', '&ge;', '&ne;', ''];
        const unescapedStrings = ['<', '>', 'Hello', '≤', '≥', '≠', ''];
        escapedStrings.forEach((escapedString, index) => {
            expect(pipe.transform(escapedString)).toBe(unescapedStrings[index]);
        });
    });
});
