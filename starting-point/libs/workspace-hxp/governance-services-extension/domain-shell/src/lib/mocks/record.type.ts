/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface GovernanceRecord {
    createdByUser?: string;
    createdAt?: string;
    modifiedByUser?: string;
    modifiedAt?: string;
    contentID?: string;
    cutOffDate?: string;
    contentMetadata?: string;
    categoryId?: string;
    environmentDataSourceId?: string;
    environmentID?: string;
    id?: string | null;
    fileName?: string | null;
    status?: string;
    entityType?: string;
    retainUntil?: string;
}

export interface ActionContext {
    records: GovernanceRecord[];
    showPanel?: boolean;
}

export type RecordIdentity = Pick<GovernanceRecord, 'environmentDataSourceId' | 'categoryId' | 'cutOffDate'>;

export interface LegalCase {
    legalCaseId?: string;
    legalCaseName?: string;
    legalCaseReason?: string;
    recordsCount?: number;
    createdAt?: string;
    createdByUsername?: string;
}
