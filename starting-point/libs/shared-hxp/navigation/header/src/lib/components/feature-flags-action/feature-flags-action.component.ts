/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { SatIconModule } from '@hylandsoftware/satori-ui';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { FlagsOverrideComponent, FlagsOverrideToken } from '@alfresco/adf-core/feature-flags';
import { FeaturesDialogService } from '../../services/features-dialog.service';

@Component({
    selector: 'hxp-feature-flags-action',
    standalone: true,
    imports: [MatMenuModule, SatIconModule, MatIconModule, TranslatePipe, FlagsOverrideComponent],
    templateUrl: './feature-flags-action.component.html',
    styleUrl: './feature-flags-action.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class FeatureFlagsActionComponent {
    public readonly flagsOverride = inject(FlagsOverrideToken);
    public readonly featuresDialogService = inject(FeaturesDialogService);
}
