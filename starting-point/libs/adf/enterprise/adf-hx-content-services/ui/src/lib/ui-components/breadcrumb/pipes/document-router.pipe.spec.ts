/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentRouterPipe } from './document-router.pipe';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentRouterService } from '@alfresco/adf-hx-content-services/services';

describe('DocumentRouterPipe', () => {
    let documentRouterPipe: DocumentRouterPipe;
    let routerService: jest.Mocked<DocumentRouterService>;

    beforeEach(() => {
        routerService = {
            urlFor: jest.fn(),
        } as any;
        documentRouterPipe = new DocumentRouterPipe(routerService);
    });

    it('should call urlFor for relative path', () => {
        const document = { sys_id: '123' } as Document;
        const expectedUrl = '/documents/123';
        routerService.urlFor.mockReturnValue(expectedUrl);

        const result = documentRouterPipe.transform(document);

        expect(result).toBe(expectedUrl);
        expect(routerService.urlFor).toHaveBeenCalledWith(document, { absolute: false });
    });

    it('should call urlFor for absolute path', () => {
        const document = { sys_id: '123' } as Document;
        const expectedUrl = 'http://localhost/documents/123';
        routerService.urlFor.mockReturnValue(expectedUrl);

        const result = documentRouterPipe.transform(document, { absolute: true });

        expect(result).toBe(expectedUrl);
        expect(routerService.urlFor).toHaveBeenCalledWith(document, { absolute: true });
    });
});
