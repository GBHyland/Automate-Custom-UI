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
    table: {
        path: resolve(__dirname, 'Basketball-stats.pdf'),
        title: 'basketball-stats',
        mimeType: 'application/pdf',
    } as FileProperties,
    tableRepeat: {
        path: resolve(__dirname, 'Basketball-stats(repeat).pdf'),
        title: 'basketball-stats-repeat',
        mimeType: 'application/pdf',
    } as FileProperties,
    invoice1: {
        path: resolve(__dirname, 'pw-e2e-invoice-1.pdf'),
        title: 'pw-e2e-invoice-1',
        mimeType: 'application/pdf',
    } as FileProperties,
    invoice1FileNoDates: {
        path: resolve(__dirname, 'pw-e2e-no-dates-invoice-1.pdf'),
        title: 'pw-e2e-no-dates-invoice-1',
        mimeType: 'application/pdf',
    } as FileProperties,
    basketball4tables1page: {
        path: resolve(__dirname, 'pw-e2e-basketball-stats-4tables-1page.pdf'),
        title: 'pw-e2e-basketball-stats-4tables-1page',
        mimeType: 'application/pdf',
    } as FileProperties,
    invoice3Pages: {
        path: resolve(__dirname, 'pw-e2e-3-page-invoice.pdf'),
        title: 'pw-e2e-invoice-3-pages',
        mimeType: 'application/pdf',
    } as FileProperties,
    basketball2tables1pageBlankFields: {
        path: resolve(__dirname, 'pw-e2e-basketball-stats-1page2tablesBlankFields.pdf'),
        title: 'pw-e2e-basketball-stats-1page2tablesBlankFields',
        mimeType: 'application/pdf',
    } as FileProperties,
    enrollmentNoFields: {
        path: resolve(__dirname, 'pw-e2e-enrollment-form-3page-no-fields.pdf'),
        title: 'pw-e2e-enrollment-form-3page-no-fields',
        mimeType: 'application/pdf',
    } as FileProperties,
    basketballStatsMissingFields: {
        path: resolve(__dirname, 'pw-e2e-basketball-stats-missing-fields.pdf'),
        title: 'pw-e2e-basketball-stats-missing-fields',
        mimeType: 'application/pdf',
    } as FileProperties,
    maxFields100: {
        path: resolve(__dirname, 'pw-e2e-maxFields100Document.pdf'),
        title: 'pw-e2e-maxFields100Document',
        mimeType: 'application/pdf',
    } as FileProperties,
    reasoningFieldsResume: {
        path: resolve(__dirname, 'pw-e2e-reasoning-fields-resume.pdf'),
        title: 'pw-e2e-reasoning-fields-resume',
        mimeType: 'application/pdf',
    } as FileProperties,
};
