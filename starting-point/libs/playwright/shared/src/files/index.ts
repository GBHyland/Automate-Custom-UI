/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileProperties } from '../api/models/file-properties';

import path from 'node:path';

export const files: { [key: string]: FileProperties } = {
    jpgFile: {
        title: 'sample.jpg',
        mimeType: 'image/jpeg',
        path: path.join(__dirname, '/sample.jpg'),
    },
    pdfFile: {
        title: 'sample.pdf',
        mimeType: 'application/pdf',
        path: path.join(__dirname, '/sample.pdf'),
    },
    txtFile: {
        title: 'sample.txt',
        mimeType: 'text/plain',
        path: path.join(__dirname, '/sample.txt'),
    },
    docFile: {
        title: 'sample.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        path: path.join(__dirname, '/sample.docx'),
    },
    xlsFile: {
        title: 'sample.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        path: path.join(__dirname, '/sample.xlsx'),
    },
    pptFile: {
        title: 'sample.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        path: path.join(__dirname, '/sample.pptx'),
    },
    tiffFile: {
        title: 'sample.tiff',
        mimeType: 'image/tiff',
        path: path.join(__dirname, '/sample.tiff'),
    },
    invalidFile: {
        title: 'invalid.jpg',
        mimeType: 'application/pdf',
        path: path.join(__dirname, '/sample.jpg'),
    },
};

export { expect } from '@playwright/test';
