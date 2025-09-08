/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActionContext, ManageVersionsButtonActionService } from '@alfresco/adf-hx-content-services/services';
import { BetaChipTagComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';

@Component({
    selector: 'hxp-manage-versions-button',
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatIconModule, MatMenuModule, BetaChipTagComponent],
    templateUrl: './manage-versions-button.component.html',
    styleUrls: ['./manage-versions-button.component.scss'],
})
export class ManageVersionsButtonComponent implements OnChanges {
    @Input() data: ActionContext = { documents: [] };
    @Input() isAvailable = false;

    constructor(private manageVersionsButtonActionService: ManageVersionsButtonActionService) {}

    ngOnChanges(): void {
        this.isAvailable = this.manageVersionsButtonActionService.isAvailable(this.data);
    }

    openManageVersions() {
        this.manageVersionsButtonActionService.execute({ ...this.data, showPanel: 'version' });
    }
}
