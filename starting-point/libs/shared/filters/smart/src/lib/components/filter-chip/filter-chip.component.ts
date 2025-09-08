/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-filter-chip',
    templateUrl: './filter-chip.component.html',
    styleUrls: ['./filter-chip.component.scss'],
    standalone: true,
    imports: [CommonModule, MatChipsModule, MatIconModule, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipComponent {
    @Input() label = '';
    @Input() suffix: string | null = null;
    @Input() chipCount: number | null = null;
    @Input() removable = true;

    @Output() chipClick = new EventEmitter<void>();
    @Output() removeIconClick = new EventEmitter<void>();
}
