/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getHighestPermission, NewPermission, Permission } from '@alfresco/adf-hx-content-services/services';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { NewPermissionLabels, PermissionLabels } from '../models/permissions-label.model';

@Component({
    selector: 'hxp-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, MatFormFieldModule, MatSelectModule, FormsModule, NgFor, MatOptionModule, MatIconModule, KeyValuePipe, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent {
    @Input()
    permission?: NewPermission;

    @Input()
    inheritedPermission: Permission = 'None';

    @Input()
    inheritanceEnabled = true;

    @Input()
    disabled = false;

    @Output()
    changePermission: EventEmitter<NewPermission> = new EventEmitter();

    protected readonly permissionLabels = PermissionLabels;

    protected readonly newPermissionLabels = NewPermissionLabels;

    protected onPermissionChange($event: NewPermission) {
        this.changePermission.emit($event);
    }

    protected isOptionDisabled = (permission: string): boolean => {
        return this.inheritanceEnabled && this.inheritedPermission !== 'None' && this.isPermissionLowerThanInherited(permission as Permission);
    };

    protected originalOrder = (): number => 0;

    protected optionTrackBy(index: number) {
        return index;
    }

    private isPermissionLowerThanInherited(permission: Permission): boolean {
        return getHighestPermission(permission, this.inheritedPermission) === this.inheritedPermission;
    }
}
