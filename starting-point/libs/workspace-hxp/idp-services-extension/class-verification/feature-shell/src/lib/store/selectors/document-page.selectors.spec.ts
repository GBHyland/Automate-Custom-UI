/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import { selectDeletedPages } from './document-page.selectors';

describe('Document Page Selectors', () => {
    it('should select deleted document pages', () => {
        const pages = mockDocumentEntities().flatMap((document) => document.pages);
        pages[1].markAsDeleted = true;
        pages[3].markAsDeleted = true;
        const result = selectDeletedPages.projector(pages);
        expect(result.length).toEqual(2);
        expect(result.some((page) => page.id === pages[1].id)).toBeTrue();
        expect(result.some((page) => page.id === pages[3].id)).toBeTrue();
        expect(result.some((page) => page.id === pages[2].id)).toBeFalse();
    });
});
