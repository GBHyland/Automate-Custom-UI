/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { ActionContext, GovernanceRecord } from '../../../mocks/record.type';
import { MatDialog } from '@angular/material/dialog';
import { LegalHoldListComponent } from '../../dialogs/legal-hold-list/legal-hold-list.component';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { map, Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class AddLegalHoldButtonService {
    private dialog = inject(MatDialog);
    private readonly featuresService = inject<IFeaturesService>(FeaturesServiceToken);

    isAvailable(records: GovernanceRecord[]): Observable<boolean> {
        return this.featuresService
            .isOn$(ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_GOVERNANCE_WORKSPACE_LEGAL_HOLD)
            .pipe(map((isOn) => isOn && records.length > 0));
    }

    execute(context?: ActionContext): void {
        this.dialog.open(LegalHoldListComponent, {
            width: '1200px',
            data: {
                ...context,
            },
        });
    }
}
