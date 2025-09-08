/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestingString } from './testing-string.service';

/* cspell: disable */
const LOWER_CASE_ALPHA = 'abcdfghjklmnpqrstvwxyz';
const UPPER_CASE_ALPHA = 'ABCDFGHJKLMNPQRSTVWXYZ';
const DIGITS = '1234567890';
const SPECIAL_WHITESPACE = '	!@#$%^&*()_+{}|:"<>?`-=[];\\,./ ';
/* cspell: enable */

export class UtilRandom {
    // TODO: This is modeling specific, doesn't belong here
    static generateEntityName() {
        return UtilRandom.generateLowerCaseAlphaNumeric(5);
    }

    static generateTimestampWithAlfaLowerCase(length: number) {
        return `${UtilRandom.generateTimeStamp()}-${UtilRandom.generateAlphaNumeric(length)}`;
    }

    // TODO: This is modeling specific, doesn't belong here
    static generateEntityNameWithoutDigits() {
        return UtilRandom.generateLowerCaseAlpha(5);
    }

    // TODO: This is modeling specific, doesn't belong here
    static generateProcessEntityUUID() {
        return `Process_${UtilRandom.generateAlphaNumeric(9)}`;
    }

    static generateTimeStamp(): number {
        return new Date().getTime();
    }

    static generateAlphaLowerCase(length: number) {
        return TestingString.generateRandomCharset(length, `${DIGITS}${LOWER_CASE_ALPHA}`);
    }

    static generateAlphaNumeric(length: number) {
        return TestingString.generateRandomCharset(length, `${DIGITS}${LOWER_CASE_ALPHA}${UPPER_CASE_ALPHA}`);
    }

    static generateLowerCaseAlphaNumeric(length: number) {
        return TestingString.generateRandomCharset(length, `${DIGITS}${LOWER_CASE_ALPHA}`);
    }

    static generateAlpha(length: number) {
        return TestingString.generateRandomCharset(length, `${LOWER_CASE_ALPHA}${UPPER_CASE_ALPHA}`);
    }

    static generateLowerCaseAlpha(length: number) {
        return TestingString.generateRandomCharset(length, LOWER_CASE_ALPHA);
    }

    static generateSpecialWhitespace(length: number) {
        return TestingString.generateRandomCharset(length, SPECIAL_WHITESPACE);
    }
}
