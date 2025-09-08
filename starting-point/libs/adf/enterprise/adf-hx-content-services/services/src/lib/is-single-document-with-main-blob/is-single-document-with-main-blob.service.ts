/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';

@Injectable({
    providedIn: 'root',
})
export class IsSingleDocumentWithMainBlobService {
    /**
     * Checks if the given array of documents represents a single document with a valid file blob.
     *
     * @param documents - The array of documents to be checked.
     * @returns A boolean value indicating whether the array represents a single document with a valid file blob.
     */
    validate(documents: Document[]): boolean {
        return this.isOneFileDocument(documents) && this.hasValidFileBlob(documents[0]);
    }

    private isOneFileDocument(documents: Document[]) {
        return documents.length === 1 && !documents[0].sys_isFolderish;
    }

    private hasValidFileBlob({ sysfile_blob }: Document) {
        return Boolean(sysfile_blob?.filename);
    }
}
