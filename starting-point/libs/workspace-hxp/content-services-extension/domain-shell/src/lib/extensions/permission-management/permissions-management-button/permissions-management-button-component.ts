/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { ActionContext, DocumentActionService, HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';

@Component({
    selector: 'hxp-permissions-management-button',
    templateUrl: './permissions-management-button-component.html',
    standalone: true,
    imports: [MatIconModule, MatMenuModule, TranslatePipe, CommonModule, FeaturesDirective],
})
export class PermissionsManagementButtonComponent implements OnChanges {
    @Input() data: ActionContext = { documents: [] };
    @Input() isAvailable = false;

    constructor(@Inject(HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE) private permissionsButtonActionService: DocumentActionService) {}

    ngOnChanges(): void {
        this.isAvailable = this.permissionsButtonActionService.isAvailable(this.data);
    }

    openPermissionsManagement() {
        this.permissionsButtonActionService.execute(this.data);
    }
}
