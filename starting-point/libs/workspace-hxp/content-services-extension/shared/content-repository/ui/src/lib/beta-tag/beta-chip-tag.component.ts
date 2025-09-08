/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    standalone: true,
    selector: 'hxp-beta-chip-tag',
    templateUrl: './beta-chip-tag.component.html',
    styleUrls: ['./beta-chip-tag.component.scss'],
    imports: [MatChipsModule, CommonModule],
})
export class BetaChipTagComponent {}
