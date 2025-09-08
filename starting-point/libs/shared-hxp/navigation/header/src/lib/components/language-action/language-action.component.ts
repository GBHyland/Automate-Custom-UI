/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { SatIconModule } from '@hylandsoftware/satori-ui';
import { LanguageMenuComponent } from '@alfresco/adf-core';
import { TranslatePipe } from '@ngx-translate/core';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';

@Component({
    selector: 'hxp-language-action',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatIconModule, SatIconModule, LanguageMenuComponent, TranslatePipe, AsyncPipe],
    templateUrl: './language-action.component.html',
})
export class LanguageActionComponent {
    public readonly featuresService = inject(FeaturesServiceToken);

    enableLocalisationFeatureFlag = STUDIO_SHARED.ENABLE_LOCALISATION;

    @ViewChild(MatMenuTrigger) private readonly trigger: MatMenuTrigger | undefined;

    @HostListener('mouseenter') onMouseEnter() {
        this.trigger?.openMenu();
    }
}
