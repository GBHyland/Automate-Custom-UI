/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export class TestingString {
    /**
     * Generates a random string - non-latin characters only.
     *
     * @param length If this parameter is not provided the length is set to 3 by default.
     * @returns random string
     */
    static generateRandomStringNonLatin(length: number = 3): string {
        return TestingString.generateRandomCharset(length, '密码你好𠮷');
    }

    /**
     * Generates a random string.
     *
     * @param length If this parameter is not provided the length is set to 8 by default.
     * @param charSet to use
     * @returns random string
     */
    static generateRandomCharset(length: number = 8, charSet: string): string {
        let text = '';

        for (let i = 0; i < length; i++) {
            text += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }

        return text;
    }
}
