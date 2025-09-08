/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { SatIconModule } from '@hylandsoftware/satori-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { HEADER_CONFIG_TOKEN } from '../../tokens/header-config.token';

@Component({
    selector: 'hxp-help-action',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatIconModule, SatIconModule, TranslatePipe],
    templateUrl: './help-action.component.html',
})
export class HelpActionComponent {
    public readonly headerConfig = inject(HEADER_CONFIG_TOKEN);
}
