/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpJoinPipe } from './join-pipe';

describe('JoinPipe', () => {
    let pipe: IdpJoinPipe;

    beforeEach(() => {
        pipe = new IdpJoinPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should join array of strings with default space', () => {
        const result = pipe.transform(['hello', 'world']);
        expect(result).toBe('hello world');
    });

    it('should join array of strings with provided join character', () => {
        const result = pipe.transform(['hello', 'world'], '-');
        expect(result).toBe('hello-world');
    });

    it('should filter out falsy values and join remaining strings', () => {
        // eslint-disable-next-line unicorn/no-null
        const result = pipe.transform(['hello', null, 'world', undefined, '']);
        expect(result).toBe('hello world');
    });

    it('should throw an error if input is not an array', () => {
        expect(() => pipe.transform('not an array' as any)).toThrowError('IdpJoinPipe: Input is not an array.');
    });

    it('should return an empty string if input array is empty', () => {
        const result = pipe.transform([]);
        expect(result).toBe('');
    });

    it('should join array of numbers with default space', () => {
        const result = pipe.transform([1, 2, 3]);
        expect(result).toBe('1 2 3');
    });

    it('should join array of mixed types with provided join character', () => {
        const result = pipe.transform(['hello', 123, true], ',');
        expect(result).toBe('hello,123,true');
    });
});
