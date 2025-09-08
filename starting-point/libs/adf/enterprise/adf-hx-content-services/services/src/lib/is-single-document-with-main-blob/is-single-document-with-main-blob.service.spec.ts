/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IsSingleDocumentWithMainBlobService } from './is-single-document-with-main-blob.service';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';

describe('IsSingleDocumentWithMainBlobService', () => {
    let service: IsSingleDocumentWithMainBlobService;

    beforeEach(() => {
        service = new IsSingleDocumentWithMainBlobService();
    });

    it('given only one File Document, should return true', () => {
        let documents: Document[] = [];

        expect(service.validate(documents)).toBe(false);

        documents = [jestMocks.fileDocument];

        expect(service.validate(documents)).toBe(true);

        documents = [jestMocks.fileDocument, jestMocks.fileDocument];

        expect(service.validate(documents)).toBe(false);
    });

    it('given a Folder Document, should return false', () => {
        const documents = [jestMocks.folderDocument];

        expect(service.validate(documents)).toBe(false);
    });

    it('given a File Document without blob, should return false', () => {
        const mockMissingBlobFileDocument = {
            ...jestMocks.fileDocument,
            sysfile_blob: undefined,
        };
        const documents = [mockMissingBlobFileDocument];

        expect(service.validate(documents)).toBe(false);
    });
});
