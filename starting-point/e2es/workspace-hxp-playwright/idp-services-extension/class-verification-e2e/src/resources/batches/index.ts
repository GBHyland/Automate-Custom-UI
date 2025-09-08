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
    resume1: {
        batchStateSnapshot: require('./resume1.json'),
        localContentFiles: [TEST_FILES.resume1],
        processInfoKey: 'idpClassVerification',
    },
    oneInvoice: {
        batchStateSnapshot: require('./invoice1.json'),
        localContentFiles: [TEST_FILES.invoice1],
        processInfoKey: 'idpClassVerification',
    },
    twoInvoices: {
        batchStateSnapshot: require('./twoInvoices.json'),
        localContentFiles: [TEST_FILES.invoice1, TEST_FILES.invoice2],
        processInfoKey: 'idpClassVerification',
    },
    claimable: {
        batchStateSnapshot: require('./claimable.json'),
        localContentFiles: [TEST_FILES.invoice1],
        processInfoKey: 'idpClaimClassificationTask',
    },
});
