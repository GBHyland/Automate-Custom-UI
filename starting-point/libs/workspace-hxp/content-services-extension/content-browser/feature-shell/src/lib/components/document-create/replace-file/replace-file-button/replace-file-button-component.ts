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
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { ReplaceFileButtonComponentActionService } from './replace-file-button-component-action.service';
import { BetaChipTagComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';

@Component({
    selector: 'hxp-replace-file-button',
    standalone: true,
    imports: [CommonModule, MatChipsModule, MatIconModule, MatMenuModule, TranslatePipe, BetaChipTagComponent],
    templateUrl: './replace-file-button-component.html',
    styleUrls: ['./replace-file-button-component.scss'],
})
export class ReplaceFileButtonComponent implements OnChanges {
    @Input() isAvailable = false;
    @Input() data: ActionContext = { documents: [] };

    constructor(private replaceFileButtonActionService: ReplaceFileButtonComponentActionService) {}

    ngOnChanges(): void {
        this.isAvailable = this.replaceFileButtonActionService.isAvailable(this.data);
    }

    protected triggerFileSelection(): void {
        this.replaceFileButtonActionService.execute(this.data);
    }
}
