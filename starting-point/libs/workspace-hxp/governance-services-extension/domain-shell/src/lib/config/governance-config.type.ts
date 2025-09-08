/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface GovernanceConfigModel {
    dataSources: DataSource[];
    filePlans: FilePlan[];
    categories: Category[];
}

export interface DataSource {
    createdByUser: any;
    createdAt: string | null;
    modifiedByUser: any;
    modifiedAt: string | null;
    name: string;
    description: string | null;
    type: string | null;
    dataSourceId: string | null;
    repoUrl: string | null;
    id: string;
}

export interface FilePlan {
    createdByUser: any;
    createdAt: string | null;
    modifiedByUser: any;
    modifiedAt: string | null;
    id: string;
    name: string;
    description: string | null;
    key: string | null;
    datasource: DataSource;
    categories: Category[] | null;
    filePlanType: string;
}

export interface Category {
    createdByUser: any;
    createdAt: string | null;
    modifiedByUser: any;
    modifiedAt: string | null;
    name: string;
    description: string | null;
    inheritParentRetention: any;
    parentId: string | null;
    filePlanId: string | null;
    retentionPolicy: {
        name: string | null;
        description: string | null;
        contentFocus: any;
        triggerCondition: {
            immediate: boolean;
            propertyBased: string;
            eventBased: string;
        };
        retentionPeriod: any;
        disposition: {
            action: string;
        };
    };
    contentFocus: {
        createdByUser: any;
        createdAt: string | null;
        modifiedByUser: any;
        modifiedAt: string | null;
        contentType: string;
    };
    id: string;
    categories: Category[] | null;
}

export interface GovernanceUser {
    id: string;
    username: string;
    email: string;
}

export interface GovernanceApiContext {
    govUrl: string;
    environmentKey: string;
    environmentId: string;
}
