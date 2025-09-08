/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { GovernanceRecord } from '../../mocks/record.type';

export interface CreateLegalHoldCaseDialogData {
    clickedFrom: LegalHoldInitiatorType;
}
export interface LegalHoldCase {
    createdByUser?: string;
    createdAt?: string;
    modifiedByUser?: string;
    modifiedAt?: string;
    createdByUsername?: string;
    modifiedByUsername?: string;
    legalCaseId?: string;
    legalCaseName?: string;
    legalCaseDescription?: string | null;
    environmentId?: string;
    legalCaseReason?: string;
}

export interface AssignRecordPayload {
    records: GovernanceRecord[];
    legalCaseIds: (string | undefined)[];
}

export type LegalHoldCaseIdentity = Pick<LegalHoldCase, 'legalCaseName' | 'legalCaseReason' | 'legalCaseDescription'>;

export enum LegalHoldInitiator {
    Record = 'Record',
    Legal = 'Legal',
}

export type LegalHoldInitiatorType = keyof typeof LegalHoldInitiator;
