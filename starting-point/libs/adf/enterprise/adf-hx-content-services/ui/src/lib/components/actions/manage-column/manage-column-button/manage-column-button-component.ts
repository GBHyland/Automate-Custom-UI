/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentActionService, HXP_MANAGE_COLUMN_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { NgIf } from '@angular/common';
import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'hxp-manage-column-button',
    templateUrl: './manage-column-button-component.html',
    imports: [NgIf, MatIconModule, MatButtonModule, MatTooltipModule, TranslatePipe],
})
export class ManageColumnButtonComponent implements OnChanges {
    @Input() actionContext: ActionContext = { documents: [] };
    @Input() isAvailable = false;

    constructor(
        @Inject(HXP_MANAGE_COLUMN_ACTION_SERVICE)
        private manageColumnActionService: DocumentActionService
    ) {}

    ngOnChanges(): void {
        this.isAvailable = this.manageColumnActionService.isAvailable(this.actionContext);
    }

    onCopy(): void {
        this.manageColumnActionService.execute(this.actionContext);
    }
}
