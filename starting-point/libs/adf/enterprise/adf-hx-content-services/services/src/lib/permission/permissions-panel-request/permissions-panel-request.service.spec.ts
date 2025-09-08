/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PermissionsPanelRequestService } from './permissions-panel-request.service';

describe('PermissionsPanelRequestService', () => {
    let permissionsPanelRequestService: PermissionsPanelRequestService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [PermissionsPanelRequestService],
        });
        permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);
    });

    it('should notify requests for opening permissions panel', async () => {
        const panelRequestPromise = firstValueFrom(permissionsPanelRequestService.notifications$);
        permissionsPanelRequestService.requestOpenPanel();
        const request = await panelRequestPromise;

        expect(request).toBe(true);
    });

    it('should notify requests for closing permissions panel', async () => {
        const panelRequestPromise = firstValueFrom(permissionsPanelRequestService.notifications$);
        permissionsPanelRequestService.requestClosePanel();
        const request = await panelRequestPromise;

        expect(request).toBe(false);
    });
});
