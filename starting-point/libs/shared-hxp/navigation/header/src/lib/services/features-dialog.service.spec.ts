/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FeaturesDialogService } from './features-dialog.service';
import { DialogService } from '@alfresco-dbp/shared/dialog';
import { FlagsComponent } from '@alfresco/adf-core/feature-flags';
import { FEATURES_DIALOG_OVERRIDE } from '../constants/features.dialog-override.constant';

describe('FeaturesDialogService', () => {
    let service: FeaturesDialogService;

    const dialogServiceMock = {
        openDialog: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: DialogService,
                    useValue: dialogServiceMock,
                },
            ],
        });

        service = TestBed.inject(FeaturesDialogService);
    });

    it('should open dialog with correct params', () => {
        service.openDialog();
        expect(dialogServiceMock.openDialog).toHaveBeenCalledWith(FlagsComponent, FEATURES_DIALOG_OVERRIDE);
    });
});
