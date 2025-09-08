/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { IsFolderishDocumentPipe } from './is-folderish-document.pipe';

describe('Is Folderish Document Pipe', () => {
    let pipe: IsFolderishDocumentPipe;

    beforeEach(() => {
        pipe = new IsFolderishDocumentPipe();
    });

    it('should be a folderish document', () => {
        expect(pipe.transform(mocks.folderDocument)).toBeTruthy();
    });

    it('should not be a folderish document', () => {
        expect(pipe.transform(mocks.fileDocument)).toBeFalsy();
    });
});
