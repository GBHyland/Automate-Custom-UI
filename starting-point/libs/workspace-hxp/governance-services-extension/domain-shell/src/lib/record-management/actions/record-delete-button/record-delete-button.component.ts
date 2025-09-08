/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActionContext } from '../../../mocks/record.type';
import { RecordDeleteButtonService } from './record-delete-button.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'hxp-record-delete-button',
    standalone: true,
    templateUrl: './record-delete-button.component.html',
    imports: [MatIconModule, MatButtonModule, TranslatePipe, MatTooltipModule],
})
export class RecordDeleteButtonComponent {
    @Input() actionContext!: ActionContext;

    private recordDeleteButtonService = inject(RecordDeleteButtonService);

    get isAvailable(): boolean {
        return this.recordDeleteButtonService.isAvailable(this.actionContext.records);
    }

    protected onDelete() {
        this.recordDeleteButtonService.execute(this.actionContext);
    }
}
