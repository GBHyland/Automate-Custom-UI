/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createIdpBatchStateSnapshotTemplateMap } from '@hxp/playwright/workspace-hxp';
import { TEST_FILES } from '../files';

export const BATCH_STATE_SNAPSHOTS = createIdpBatchStateSnapshotTemplateMap({
    tableRepeat: {
        batchStateSnapshot: require('./tableRepeat.json'),
        localContentFiles: [TEST_FILES.tableRepeat, TEST_FILES.tableRepeat],
        processInfoKey: 'idpFieldVerification',
    },
    invoice1: {
        batchStateSnapshot: require('./invoice1.json'),
        localContentFiles: [TEST_FILES.invoice1],
        processInfoKey: 'idpFieldVerification',
    },
    invoice1FileNoDates: {
        batchStateSnapshot: require('./invoice1FileNoDates.json'),
        localContentFiles: [TEST_FILES.invoice1FileNoDates, TEST_FILES.invoice1],
        processInfoKey: 'idpFieldVerification',
    },
    twoDocsTableAndInvoice: {
        batchStateSnapshot: require('./twoDocsTableAndInvoice.json'),
        localContentFiles: [TEST_FILES.basketball4tables1page, TEST_FILES.invoice1],
        processInfoKey: 'idpFieldVerification',
    },
    basketball4tables1page: {
        batchStateSnapshot: require('./basketball4tables1page.json'),
        localContentFiles: [TEST_FILES.basketball4tables1page],
        processInfoKey: 'idpFieldVerification',
    },
    basketballStatsMissingFields: {
        batchStateSnapshot: require('./basketballStatsMissingFields.json'),
        localContentFiles: [TEST_FILES.basketballStatsMissingFields, TEST_FILES.invoice1],
        processInfoKey: 'idpFieldVerification',
    },
    invoice3Pages: {
        batchStateSnapshot: require('./invoice3Pages.json'),
        localContentFiles: [TEST_FILES.invoice3Pages],
        processInfoKey: 'idpFieldVerification',
    },
    maxFields100: {
        batchStateSnapshot: require('./maxFields100.json'),
        localContentFiles: [TEST_FILES.maxFields100],
        processInfoKey: 'idpFieldVerification',
    },
    reasoningFieldsResume: {
        batchStateSnapshot: require('./reasoningFieldsResume.json'),
        localContentFiles: [TEST_FILES.reasoningFieldsResume],
        processInfoKey: 'idpFieldVerification',
    },
    enrollmentForm: {
        batchStateSnapshot: require('./enrollmentForm.json'),
        localContentFiles: [TEST_FILES.enrollmentNoFields],
        processInfoKey: 'idpFieldVerification',
    },
});
