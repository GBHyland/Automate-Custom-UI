/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Permission, PermissionLabel } from '@alfresco/adf-hx-content-services/services';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export const InheritedPermissionLabels: Readonly<Record<PermissionLabel, string>> = {
    Read: 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.READ',
    ReadWrite: 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.READ_WRITE',
    Everything: 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.EVERYTHING',
    None: 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.NO_ACCESS',
    Blocked: 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.BLOCKED',
} as const;

@Component({
    selector: 'hxp-inherited-permission',
    templateUrl: './inherited-permission.component.html',
    styleUrls: ['./inherited-permission.component.scss'],
    imports: [TranslatePipe],
    standalone: true,
})
export class InheritedPermissionComponent implements OnChanges {
    @Input() permission: Permission = 'None';
    @Input() inheritanceEnabled: boolean | null = true;

    protected label = InheritedPermissionLabels[this.permission];

    ngOnChanges(): void {
        this.label = this.inheritanceEnabled ? InheritedPermissionLabels[this.permission] : InheritedPermissionLabels['Blocked'];
    }
}
