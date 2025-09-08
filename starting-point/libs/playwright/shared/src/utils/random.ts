/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* cspell: disable */
const LOWER_CASE_ALPHA = 'abcdfghjklmnpqrstvwxyz';
const UPPER_CASE_ALPHA = 'ABCDFGHJKLMNPQRSTVWXYZ';
const DIGITS = '1234567890';
// eslint-disable-next-line no-useless-escape
const SPECIAL_CHARS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
/* cspell: enable */

export class UtilRandom {
    private static generateRandomCharset(length: number = 8, charSet: string) {
        return [...new Array(length)].reduce((a) => a + charSet[Math.floor(Math.random() * charSet.length)], '');
    }

    static generateTimeStamp(): number {
        return Date.now();
    }

    static generateTimestampWithAlphaLowerCase(length: number) {
        return `${UtilRandom.generateTimeStamp()}-${UtilRandom.generateAlphaNumeric(length)}`;
    }

    static generateRandomString(length: number): string {
        return UtilRandom.generateRandomCharset(length, `${LOWER_CASE_ALPHA}${UPPER_CASE_ALPHA}${SPECIAL_CHARS}`);
    }

    static generateAlpha(length: number) {
        return UtilRandom.generateRandomCharset(length, `${LOWER_CASE_ALPHA}${UPPER_CASE_ALPHA}`);
    }

    static generateAlphaLowerCase(length: number) {
        return UtilRandom.generateRandomCharset(length, LOWER_CASE_ALPHA);
    }

    static generateAlphaUpperCase(length: number) {
        return UtilRandom.generateRandomCharset(length, UPPER_CASE_ALPHA);
    }

    static generateAlphaNumeric(length: number) {
        return UtilRandom.generateRandomCharset(length, `${DIGITS}${LOWER_CASE_ALPHA}${UPPER_CASE_ALPHA}`);
    }

    static generateAlphaNumericLowerCase(length: number) {
        return UtilRandom.generateRandomCharset(length, `${DIGITS}${LOWER_CASE_ALPHA}`);
    }

    static getRandomArrayValue<T>(arr: Array<T> | readonly T[]) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
