/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PermissionsManagementRow } from '@alfresco/adf-hx-content-services/services';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterContentChecked, Component, ContentChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-permissions-table',
    templateUrl: './permissions-table.component.html',
    styleUrls: ['./permissions-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, MatTableModule, NgTemplateOutlet, NgClass, TranslatePipe],
})
export class PermissionsTableComponent implements AfterContentChecked {
    @Input()
    title = '';

    @Input()
    activePermissionsManagementRows: PermissionsManagementRow[] = [];

    // HEADER INJECTED CONTENTS

    // unicorn/no-null rule is disabled because TemplateRef cannot be undefined, unless a default ref is provided in the template.
    // Headers have no default reference
    @ContentChild('entityColumnHeader', { static: false })
    // eslint-disable-next-line unicorn/no-null
    entityColumnHeaderTemplateRef: TemplateRef<any> | null = null;

    @ContentChild('inheritedPermissionColumnHeader', { static: false })
    // eslint-disable-next-line unicorn/no-null
    inheritedPermissionColumnHeaderTemplateRef: TemplateRef<any> | null = null;

    @ContentChild('fileColumnHeader', { static: false })
    // eslint-disable-next-line unicorn/no-null
    fileColumnHeaderTemplateRef: TemplateRef<any> | null = null;

    @ContentChild('emptyTable', { static: false })
    // eslint-disable-next-line unicorn/no-null
    emptyTableTemplateRef?: TemplateRef<any>;

    // CELL INJECTED CONTENTS

    @ContentChild('entityCell', { static: false })
    entityCellTemplateRef?: TemplateRef<any>;

    @ContentChild('inheritedPermissionCell', { static: false })
    // in this case the column is optional, therefore there is no default ref.
    // eslint-disable-next-line unicorn/no-null
    inheritedPermissionCellTemplateRef: TemplateRef<any> | null = null;

    @ContentChild('fileCell', { static: false })
    fileCellTemplateRef?: TemplateRef<any>;

    protected displayedColumns: string[] = ['permissionEntity', 'permission'];

    ngAfterContentChecked() {
        this.displayedColumns = this.getAvailableColumns();
    }

    private getAvailableColumns(): string[] {
        return this.inheritedPermissionCellTemplateRef
            ? ['permissionEntity', 'inheritedPermission', 'permission']
            : ['permissionEntity', 'permission'];
    }
}
