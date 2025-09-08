/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { RenditionsService } from './renditions.service';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { mockHxcsJsClientConfigurationService, renditionsApiProvider } from '@alfresco/adf-hx-content-services/api';
import { Injectable } from '@angular/core';

@Injectable()
export class MockRenditionsService extends RenditionsService {
    renditionsApiSpies = {
        getRendition: jest.spyOn(this.renditionsApi, 'getRendition').mockReturnValue(generateMockResponse({ data: jestMocks.renditionCompleted })),

        requestRenditionCreation: jest
            .spyOn(this.renditionsApi, 'createRendition')
            .mockReturnValue(generateMockResponse({ data: jestMocks.renditionPending })),

        listRenditions: jest
            .spyOn(this.renditionsApi, 'getRenditions')
            .mockReturnValue(generateMockResponse({ data: [jestMocks.renditionCompleted] })),
    };
}

describe('RenditionService', () => {
    let renditionsService: RenditionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: RenditionsService, useClass: MockRenditionsService }, mockHxcsJsClientConfigurationService, renditionsApiProvider],
        });
        renditionsService = TestBed.inject(RenditionsService);
    });

    it('should get rendition by id', (done) => {
        renditionsService.getRendition(jestMocks.fileDocument.sys_id, 'pdfPreview').subscribe((rendition) => {
            expect(rendition.sys_id).toEqual(jestMocks.renditionCompleted.sys_id);
            expect(rendition['sysrendition_id']).toEqual(jestMocks.renditionCompleted.sysrendition_id);
            expect((renditionsService as MockRenditionsService).renditionsApiSpies.getRendition).toHaveBeenCalled();

            done();
        });
    });

    it('should request rendition creation', (done) => {
        renditionsService.requestRenditionCreation(jestMocks.fileDocument.sys_id, 'pdfPreview').subscribe((rendition) => {
            expect(rendition.sys_id).toEqual(jestMocks.renditionPending.sys_id);
            expect(rendition['sysrendition_id']).toEqual(jestMocks.renditionPending.sysrendition_id);
            expect((renditionsService as MockRenditionsService).renditionsApiSpies.requestRenditionCreation).toHaveBeenCalled();

            done();
        });
    });

    it('should list renditions for document', (done) => {
        renditionsService.listRenditions(jestMocks.fileDocument.sys_id).subscribe((renditions) => {
            expect(renditions).toHaveLength(1);
            expect((renditionsService as MockRenditionsService).renditionsApiSpies.listRenditions).toHaveBeenCalled();

            done();
        });
    });
});
