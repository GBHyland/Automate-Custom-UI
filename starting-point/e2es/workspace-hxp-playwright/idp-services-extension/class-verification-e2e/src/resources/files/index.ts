/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'node:path';
import { FileProperties } from '@alfresco-dbp/playwright/shared';

export const TEST_FILES = {
    invoice1: {
        path: resolve(__dirname, 'pw-e2e-invoice-1.pdf'),
        title: 'pw-e2e-invoice-1',
        mimeType: 'application/pdf',
    } as FileProperties,
    resume1: {
        path: resolve(__dirname, 'pw-e2e-resume-1.pdf'),
        title: 'pw-e2e-resume-1',
        mimeType: 'application/pdf',
    } as FileProperties,
    invoice2: {
        path: resolve(__dirname, 'pw-e2e-invoice-2.pdf'),
        title: 'pw-e2e-invoice-2',
        mimeType: 'application/pdf',
    } as FileProperties,
};
