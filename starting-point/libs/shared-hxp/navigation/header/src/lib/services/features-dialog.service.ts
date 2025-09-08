/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DialogService } from '@alfresco-dbp/shared/dialog';
import { FlagsComponent } from '@alfresco/adf-core/feature-flags';
import { inject, Injectable } from '@angular/core';
import { FEATURES_DIALOG_OVERRIDE } from '../constants/features.dialog-override.constant';

@Injectable({
    providedIn: 'root',
})
export class FeaturesDialogService {
    private readonly dialogService = inject(DialogService);

    openDialog() {
        this.dialogService.openDialog(FlagsComponent, FEATURES_DIALOG_OVERRIDE);
    }
}
