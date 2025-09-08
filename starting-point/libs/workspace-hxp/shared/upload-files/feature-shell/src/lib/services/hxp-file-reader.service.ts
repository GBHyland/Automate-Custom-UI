/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileReaderService {
    /**
     * Reads the content of a file as text.
     * @param {File} file - The file to be read.
     * @returns {Promise<string>} A promise that resolves with the file content as a string.
     */
    readFileAsText(file: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }
}
