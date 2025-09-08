/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input, OnChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { CreateDocumentVersionActionService } from './document-version.service';
import { MatChipsModule } from '@angular/material/chips';
import { BetaChipTagComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';

@Component({
    selector: 'hxp-create-version',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatChipsModule, MatMenuModule, MatIconModule, TranslatePipe, BetaChipTagComponent],
    templateUrl: './document-version.component.html',
    styleUrls: ['./document-version.component.scss'],
})
export class CreateDocumentVersionButtonComponent implements OnChanges {
    @Input() isAvailable = false;
    @Input() data: ActionContext = { documents: [] };

    private createDocumentVersionService = inject(CreateDocumentVersionActionService);

    ngOnChanges(): void {
        this.updateAvailability();
    }

    private updateAvailability(): void {
        this.isAvailable = this.createDocumentVersionService.isAvailable(this.data);
    }

    protected createVersion(): void {
        this.createDocumentVersionService.execute(this.data);
    }
}
