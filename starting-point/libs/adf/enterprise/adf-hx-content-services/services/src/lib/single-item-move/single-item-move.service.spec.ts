/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { mockHxcsJsClientConfigurationService, MOVE_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { MoveApi } from '@hylandsoftware/hxcs-js-client';
import { SingleItemMoveService } from './single-item-move.service';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../adf-enterprise-adf-hx-content-services-services.providers';

describe('SingleItemMoveService', () => {
    let singleItemService: SingleItemMoveService;
    let moveApi: MoveApi;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideAdfEnterpriseAdfHxContentServicesServices(), mockHxcsJsClientConfigurationService],
        });
        singleItemService = TestBed.inject(SingleItemMoveService);
        moveApi = TestBed.inject(MOVE_API_TOKEN);
    });

    it('should call move and return SUCCESS when move file id and target file is present', (done) => {
        const moveFileId = jestMocks.fileDocument.sys_id;
        const targetParentId = jestMocks.folderDocument.sys_id;
        const moveSpy = jest.spyOn(moveApi, 'move').mockReturnValue(Promise.resolve({ data: jestMocks.nestedDocumentAncestors }));
        expect(moveSpy).toHaveBeenCalledTimes(0);
        singleItemService.move(moveFileId, targetParentId).subscribe((status) => {
            expect(moveSpy).toHaveBeenCalledTimes(1);
            expect(moveSpy).toHaveBeenCalledWith(moveFileId, 'default', {
                targetParentId,
            });
            expect(status).toEqual({ document: jestMocks.nestedDocumentAncestors, status: 'SUCCESS' });
            done();
        });
    });

    it('should call move and return ERROR when move file id is present but target file is missing', (done) => {
        const moveFileId = jestMocks.fileDocument.sys_id;
        const targetParentId = '';
        const moveSpy = jest.spyOn(moveApi, 'move').mockReturnValue(Promise.reject());
        expect(moveSpy).toHaveBeenCalledTimes(0);
        singleItemService.move(moveFileId, targetParentId).subscribe((status) => {
            expect(moveSpy).toHaveBeenCalledTimes(1);
            expect(status).toEqual({ document: undefined, status: 'ERROR' });
            done();
        });
    });

    it('should call move and return ERROR when move file id and target file both are missing', (done) => {
        const moveFileId = '';
        const targetParentId = '';
        const moveSpy = jest.spyOn(moveApi, 'move').mockReturnValue(Promise.reject());
        expect(moveSpy).toHaveBeenCalledTimes(0);
        singleItemService.move(moveFileId, targetParentId).subscribe((status) => {
            expect(moveSpy).toHaveBeenCalled();
            expect(status).toEqual({ document: undefined, status: 'ERROR' });
            done();
        });
    });
});
