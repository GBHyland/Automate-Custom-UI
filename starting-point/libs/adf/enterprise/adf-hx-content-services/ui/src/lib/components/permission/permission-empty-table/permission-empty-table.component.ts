/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'hxp-permissions-empty-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './permission-empty-table.component.html',
    styleUrls: ['./permission-empty-table.component.scss'],
})
export class PermissionEmptyTableComponent {
    @Input()
    message = '';
}
