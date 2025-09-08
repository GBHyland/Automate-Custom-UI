/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordStatusClassPipe } from './record-status-class.pipe';

describe('RecordStatusClassPipe', () => {
    let pipe: RecordStatusClassPipe;

    beforeEach(() => {
        pipe = new RecordStatusClassPipe();
    });

    it('should return the correct class for UnderRetention', () => {
        expect(pipe.transform('UnderRetention')).toBe('hxp-governance-record-status-under-retention');
    });

    it('should return the correct class for Unprocessed', () => {
        expect(pipe.transform('Unprocessed')).toBe('hxp-governance-record-status-unprocessed');
    });

    it('should return the correct class for Incomplete', () => {
        expect(pipe.transform('Incomplete')).toBe('hxp-governance-record-status-incomplete');
    });

    it('should return the correct class for Ready', () => {
        expect(pipe.transform('Ready')).toBe('hxp-governance-record-status-ready');
    });

    it('should return an empty string for unknown status', () => {
        // @ts-expect-error: testing invalid status
        expect(pipe.transform('UnknownStatus')).toBe('');
        // @ts-expect-error: testing invalid status
        expect(pipe.transform('')).toBe('');
        // @ts-expect-error: testing invalid status
        expect(pipe.transform(undefined)).toBe('');
    });
});
