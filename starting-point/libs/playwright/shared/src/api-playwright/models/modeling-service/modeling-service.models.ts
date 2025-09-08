/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pagination } from '../misc';

export interface ProjectData {
    entry: ProjectDataEntry;
}

export interface ProjectDataEntry {
    createdBy: string;
    creationDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: string;
    name: string;
    description: string;
    version: string;
    favorite: boolean;
    collaborators: ProjectCollaborator[];
}

export interface ProjectCollaborator {
    createdBy: string;
    creationDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: string;
    projectId: string;
    username: string;
}

export interface ProjectUpdateResponse {
    entry: {
        createdBy: string;
        creationDate: string;
        lastModifiedBy: string;
        lastModifiedDate: string;
        id: string;
        name: string;
        description: string;
        version: string;
    };
}

export interface ReleaseData {
    entry: ReleaseDataEntry;
}

export interface ReleaseDataEntry {
    id: string;
    name: string;
    creationDate: string;
    createdBy: string;
    lastModifiedDate: Date;
    lastModifiedBy: string;
    version?: string;
    projectName?: string;
    projectId?: string;
}

export interface ModelTypeList {
    list: ModelTypeEntries;
}

export interface ModelTypeEntries {
    entries: ModelTypeEntry[];
    pagination: Pagination;
}

export interface ModelTypeEntry {
    entry: {
        content: string;
        projects: ModelTypeProjects[];
        template: string;
        category: string;
        scope: string;
        id: string;
        name: string;
        type: string;
        version: string;
        extensions: any;
        contentType: string;
        createdBy: object;
        creationDate: string;
        lastModifiedBy: object;
        lastModifiedDate: string;
    };
}

export interface ModelTypeProjects {
    version: string;
    description: string;
    id: string;
    name: string;
    displayName: string;
    createdBy: object;
    creationDate: string;
    lastModifiedBy: object;
    lastModifiedDate: string;
}

export interface ModelContent {
    id: string;
    name: string;
    description: string;
    'adf-template': string;
    plugins: [];
    status: number;
    body: string;
}

export interface ModelContentEntry {
    entry: ModelContent;
}

export interface ModelData {
    entry: ModelDataEntry;
}

export interface ModelDataEntry {
    createdBy: string;
    creationDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: string;
    key: string;
    type: string;
    name: string;
    category: string;
    scope: string;
    extensions: object;
    version: string;
    projectIds: string[];
}

export interface ModelDetails {
    name: string;
    id?: string | null;
    type: string;
    content?: string | null;
    extensions?: any;
    version?: string | null;
    scope?: string | null;
    template?: string | null;
    projects?: any;
    category?: string | null;
    contentType?: string | null;
    lastModifiedDate?: string | null;
    createdBy?: string | null;
    creationDate?: string | null;
    lastModifiedBy?: string | null;
    description?: string | null;
}

export interface ReleaseDataList {
    list: ReleaseDataEntries;
}

export interface ReleaseDataEntries {
    entries: ReleaseDataEntry[];
    pagination: Pagination;
}

export interface ReleaseDataEntry {
    entry: {
        id: string;
        name: string;
        creationDate: string;
        createdBy: string;
        lastModifiedDate: Date;
        lastModifiedBy: string;
        version: string;
        projectName: string;
        projectId: string;
        description: string;
    };
}

export interface ReleaseQueryFilters {
    showAllVersions: boolean;
    version: string;
    maxItems: number;
    skipCount: number;
    projectName: string;
    projectId: string;
}
