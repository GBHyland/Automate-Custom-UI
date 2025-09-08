/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentActionService } from '@alfresco/adf-hx-content-services/services';
import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'hxp-version-edit-button',
    standalone: true,
    imports: [MatButtonModule, MatTooltipModule, MatIconModule, TranslateModule],
    templateUrl: './version-edit-button.component.html',
})
export class VersionEditButtonComponent implements OnChanges {
    @Input() actionContext!: ActionContext;
    protected isAvailable = false;

    constructor(
        @Inject('HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE')
        private versionEditActionService: DocumentActionService
    ) {}

    ngOnChanges(): void {
        this.isAvailable = this.versionEditActionService.isAvailable(this.actionContext);
    }

    protected onEdit() {
        this.versionEditActionService.execute(this.actionContext);
    }
}
