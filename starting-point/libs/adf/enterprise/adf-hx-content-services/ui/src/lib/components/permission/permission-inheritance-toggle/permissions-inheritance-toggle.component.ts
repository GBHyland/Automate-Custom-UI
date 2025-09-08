/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-permissions-inheritance-toggle',
    standalone: true,
    imports: [CommonModule, MatButtonToggleModule, TranslatePipe],
    templateUrl: './permissions-inheritance-toggle.component.html',
    styleUrls: ['./permissions-inheritance-toggle.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PermissionInheritanceToggleComponent {
    @Input() isInheritanceEnabled: boolean | null = true;
    @Output() toggleChange = new EventEmitter<boolean>();

    onToggleChange(isEnabled: boolean): void {
        this.toggleChange.emit(isEnabled);
    }
}
