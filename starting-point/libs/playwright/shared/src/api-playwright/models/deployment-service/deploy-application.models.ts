/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface DeployParams {
    name?: string;
    projectId: string;
    releaseId: string;
    security: {
        users: string[];
        admin: string[];
    };
    infrastructure?: {
        runtimeVersion?: string;
    };
}

export interface DeployedApplicationData {
    name: string;
    displayName: string;
    status: string;
    version: number;
    createdAt: Date;
    lastModifiedAt: Date;
    descriptor: Descriptor;
    rollback: boolean;
}

export interface ApplicationsListResponse {
    list: {
        entries: DeployedApplicationData[];
    };
}

export interface Descriptor {
    name: string;
    displayName: string;
    releaseId: string;
    projectId: string;
    projectName: string;
    releaseVersion: string;
    runtimeBundleVersion: string;
    security: Security[];
    infrastructure: any;
    variables: any;
    enableLocalDevelopment: boolean;
}

export interface Security {
    groups: string[];
    users: string[];
    role?: string;
}

export interface ApplicationDataList {
    entries: ApplicationDataEntries[];
}

export interface ApplicationDataEntries {
    entry: ApplicationDataEntry;
}

export interface ApplicationDataEntry {
    id: string;
    version: string;
    name: string;
}
