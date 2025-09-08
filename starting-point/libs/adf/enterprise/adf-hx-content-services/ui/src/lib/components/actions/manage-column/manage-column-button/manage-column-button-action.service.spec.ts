/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ManageColumnActionService } from './manage-column-button-action.service';
import { ManageColumnDialogComponent } from '../manage-column-dialog/manage-column-dialog.component';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';

describe('ManageColumnButtonActionService', () => {
    let service: ManageColumnActionService;
    let dialog: jest.Mocked<MatDialog>;

    beforeEach(() => {
        dialog = {
            open: jest.fn(),
        } as unknown as jest.Mocked<MatDialog>;

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, ManageColumnDialogComponent],
            providers: [ManageColumnActionService, { provide: MatDialog, useValue: dialog }],
        });

        service = TestBed.inject(ManageColumnActionService);
    });

    function setActionContext(refererURL: string): ActionContext {
        return { refererURL: refererURL, documents: [jestMocks.fileDocument] };
    }

    it('should be available if the refererURL includes "search"', () => {
        const context = setActionContext('http://example.com/search/results');

        expect(service.isAvailable(context)).toBe(true);
    });

    it('should not be available if the refererURL does not include "search"', () => {
        const context = setActionContext('http://example.com/other/results');

        expect(service.isAvailable(context)).toBe(false);
    });

    it('should open a dialog with the correct parameters when executed', () => {
        const context = setActionContext('http://example.com/search/results');
        service.execute(context);

        expect(dialog.open).toHaveBeenCalledWith(
            ManageColumnDialogComponent,
            expect.objectContaining({
                data: context,
            })
        );
    });
});
