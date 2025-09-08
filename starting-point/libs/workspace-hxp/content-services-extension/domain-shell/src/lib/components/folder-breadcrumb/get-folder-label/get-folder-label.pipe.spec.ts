/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockService } from 'ng-mocks';
import { GetFolderLabelPipe } from './get-folder-label.pipe';

describe('GetFolderLabelPipe', () => {
    let pipe: GetFolderLabelPipe;

    const mockTranslationService = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        instant: (_translationKey: string) => 'Root',
    };

    beforeEach(() => {
        pipe = new GetFolderLabelPipe(MockService(TranslateService, mockTranslationService));
    });

    it("should return 'Root' when the root folder is selected", () => {
        expect(pipe.transform(ROOT_DOCUMENT)).toBe('Root');
    });

    it('should return folder name only when a folder different from the root is selected', () => {
        expect(pipe.transform(jestMocks.fileDocument)).toBe(jestMocks.fileDocument.sys_name);
    });
});
