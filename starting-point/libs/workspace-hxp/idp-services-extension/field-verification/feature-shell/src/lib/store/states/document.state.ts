/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpDocument } from '../../models/screen-models';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export type DocumentEntity = Omit<IdpDocument, 'pages' | 'hasIssue'> & {
    pages: {
        id: string;
        name: string;
        fileReference: string;
        contentFileReferenceIndex: number;
        sourcePageIndex: number;
        rotation?: number;
        viewerRotation?: number;
    }[];
};

export type DocumentState = DocumentEntity & {
    selectedPageIds: string[];
    loadState: IdpLoadState;
};

export const initialDocumentState: DocumentState = {
    id: '',
    name: '',
    class: { id: '', name: '' },
    pages: [],
    selectedPageIds: [],
    loadState: IdpLoadState.NotInitialized,
};
