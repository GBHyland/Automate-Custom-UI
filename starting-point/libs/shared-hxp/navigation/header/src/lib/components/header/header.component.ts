/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatHeaderModule, SatIconModule, SatWordMarkLogoComponent } from '@hylandsoftware/satori-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { FeatureFlagsActionComponent } from '../feature-flags-action/feature-flags-action.component';
import { LanguageActionComponent } from '../language-action/language-action.component';
import { HelpActionComponent } from '../help-action/help-action.component';
import { RouterModule } from '@angular/router';
import { HEADER_CONFIG_TOKEN } from '../../tokens/header-config.token';

@Component({
    selector: 'hxp-header',
    standalone: true,
    imports: [
        CommonModule,
        SatHeaderModule,
        SatWordMarkLogoComponent,
        SatIconModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        TranslatePipe,
        FeatureFlagsActionComponent,
        LanguageActionComponent,
        HelpActionComponent,
        RouterModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    public readonly headerConfig = inject(HEADER_CONFIG_TOKEN);

    @Input() logoPath: string | undefined = undefined;
}
