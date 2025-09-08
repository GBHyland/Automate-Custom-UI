/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NoopUploadActionStrategy } from './noop-action-strategy';
import { UploadContentModel } from '../model/upload-content.model';
import { Document } from '@hylandsoftware/hxcs-js-client';

describe('NoopUploadActionStrategy', () => {
    let noopUploadActionStrategy: NoopUploadActionStrategy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NoopUploadActionStrategy],
        });
        noopUploadActionStrategy = TestBed.inject(NoopUploadActionStrategy);
    });

    it('should return the document from the upload model', (done) => {
        const mockDocument: Document = { sys_id: '123', sys_title: 'test' } as Document;
        const uploadModel: UploadContentModel = { documentModel: { document: mockDocument } } as UploadContentModel;

        noopUploadActionStrategy.execute(uploadModel).subscribe({
            next: (document) => {
                expect(document).toEqual(mockDocument);
                done();
            },
        });
    });
});
